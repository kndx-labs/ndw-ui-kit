interface RetryOptions {
  retries?: number;
  baseDelay?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const defaultShouldRetry = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return true;
  }

  const statusMatch = error.message.match(/(?:error|failed):?\s*(\d{3})/i);

  if (!statusMatch) {
    return true;
  }

  const status = parseInt(statusMatch[1], 10);

  return status >= 500 || status === 429;
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const {retries = 3, baseDelay = 300, shouldRetry = defaultShouldRetry} = options;

  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt > retries || !shouldRetry(error)) {
        throw error;
      }

      const delay = baseDelay * 2 ** (attempt - 1);

      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }
};

type Task<T> = () => Promise<T>;

export const createSemaphore = (capacity: number) => {
  let running = 0;
  const queue: Array<() => void> = [];

  const acquire = (): Promise<void> => {
    if (running < capacity) {
      running++;

      return Promise.resolve();
    }

    return new Promise((resolve) => {
      queue.push(resolve);
    });
  };

  const release = (): void => {
    running--;

    const next = queue.shift();

    if (next) {
      running++;
      next();
    }
  };

  return async <T>(task: Task<T>): Promise<T> => {
    await acquire();

    try {
      return await task();
    } finally {
      release();
    }
  };
};

export const getConcurrency = (): number => {
  const envValue = process.env.FIGMA_SYNC_CONCURRENCY;

  if (!envValue) {
    return 8;
  }

  const parsed = parseInt(envValue, 10);

  return Number.isNaN(parsed) || parsed < 1 ? 8 : parsed;
};

export interface NdwuAnimationFrames {
  readonly request: (callback: () => void) => number;
  readonly cancel: (id: number) => void;
}

// `debounce`: a new request replaces the pending one.
// `throttle`: a new request is ignored while one is pending.
export type NdwuFrameMode = 'debounce' | 'throttle';

const BROWSER_FRAMES: NdwuAnimationFrames = {
  request: (callback) => {
    return requestAnimationFrame(callback);
  },
  cancel: (id) => {
    cancelAnimationFrame(id);
  },
};

/**
 * Runs callbacks on the next animation frame, at most one pending callback per key.
 */
export class NdwuFrameScheduler<TKey extends string> {
  private readonly frameIds = new Map<TKey, number>();

  constructor(
    private readonly frames: NdwuAnimationFrames = BROWSER_FRAMES,
  ) {}

  public schedule(key: TKey, callback: () => void, mode: NdwuFrameMode): void {
    if (this.frameIds.has(key)) {
      if (mode === 'throttle') {
        return;
      }

      this.cancel(key);
    }

    const id = this.frames.request(() => {
      // forget the frame first, so the callback can schedule the same key again
      this.frameIds.delete(key);
      callback();
    });

    this.frameIds.set(key, id);
  }

  public cancel(key: TKey): void {
    const id = this.frameIds.get(key);

    if (id === undefined) {
      return;
    }

    this.frames.cancel(id);
    this.frameIds.delete(key);
  }

  public cancelAll(): void {
    for (const id of this.frameIds.values()) {
      this.frames.cancel(id);
    }

    this.frameIds.clear();
  }
}

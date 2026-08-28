export function onAnimationEndOrFallback(
  element: HTMLElement,
  fallbackDurationMs: number,
  callback: () => void,
): () => void {
  let isDone = false;

  const cleanup = (): void => {
    element.removeEventListener('animationend', handleAnimationEnd);
    clearTimeout(fallbackTimerId);
  };

  const finish = (): void => {
    if (isDone) {
      return;
    }

    isDone = true;
    cleanup();
    callback();
  };

  const handleAnimationEnd = (event: AnimationEvent): void => {
    if (event.target === element) {
      finish();
    }
  };

  const fallbackTimerId = setTimeout(finish, fallbackDurationMs);

  element.addEventListener('animationend', handleAnimationEnd);

  return cleanup;
}

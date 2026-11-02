import {type Signal, signal} from '@angular/core';

export interface NdwuActivityTimers {
  readonly set: (callback: () => void, delayMs: number) => number;
  readonly clear: (id: number) => void;
  readonly now: () => number;
}

const BROWSER_TIMERS: NdwuActivityTimers = {
  set: (callback, delayMs) => window.setTimeout(callback, delayMs),
  clear: (id) => window.clearTimeout(id),
  now: () => Date.now(),
};

/** Tracks recent scroll and drag activity for coarse scrollbar presentation. */
export class NdwuScrollbarActivity {
  private readonly active = signal(false);
  public readonly isActive: Signal<boolean> = this.active.asReadonly();

  private dragging = false;
  private disposed = false;
  private deadline = 0;
  private timeoutId: number | undefined;

  constructor(
    private readonly delayMs = 1000,
    private readonly timers: NdwuActivityTimers = BROWSER_TIMERS,
  ) {}

  public markScroll(): void {
    if (this.disposed) {
      return;
    }

    this.setActive(true);

    if (this.dragging) {
      return;
    }

    this.deadline = this.timers.now() + this.delayMs;
    this.armTimeout();
  }

  public startDrag(): void {
    if (this.disposed) {
      return;
    }

    this.setActive(true);
    this.dragging = true;
    this.cancelTimeout();
  }

  public endDrag(): void {
    if (this.disposed) {
      return;
    }

    this.dragging = false;
    this.deadline = this.timers.now() + this.delayMs;
    this.armTimeout();
  }

  public reset(): void {
    if (this.disposed) {
      return;
    }

    this.cancelTimeout();
    this.deadline = 0;
    this.dragging = false;
    this.setActive(false);
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.reset();
    this.disposed = true;
  }

  private armTimeout(): void {
    if (this.timeoutId !== undefined) {
      return;
    }

    const remaining = Math.max(0, this.deadline - this.timers.now());

    this.timeoutId = this.timers.set(() => {
      this.timeoutId = undefined;

      if (this.disposed || this.dragging) {
        return;
      }

      const timeUntilDeadline = this.deadline - this.timers.now();

      if (timeUntilDeadline > 0) {
        this.armTimeout();

        return;
      }

      this.setActive(false);
    }, remaining);
  }

  private cancelTimeout(): void {
    if (this.timeoutId === undefined) {
      return;
    }

    this.timers.clear(this.timeoutId);
    this.timeoutId = undefined;
  }

  private setActive(isActive: boolean): void {
    if (this.active() !== isActive) {
      this.active.set(isActive);
    }
  }
}

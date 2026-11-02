import {Injector, afterNextRender} from '@angular/core';
import type {NdwuPopoverConfig} from './ndwu-popover.types';

export type NdwuPopoverDismissReason = 'escape' | 'origin-click' | 'outside' | 'detached';

export type NdwuPopoverCloseReason = NdwuPopoverDismissReason | 'explicit' | 'hover' | 'destroy' | 'error';

export interface NdwuPopoverSessionRef {
  isActive(): boolean;
  onFinish(cleanup: () => void): void;
  afterNextRender(fn: () => void): void;
  close(reason: NdwuPopoverDismissReason): void;
}

export interface NdwuPopoverFinishState {
  reason: NdwuPopoverCloseReason;
  focusOrigin: boolean | undefined;
  focusInPane: boolean;
  focusLost: boolean;
}

export class NdwuPopoverSession implements NdwuPopoverSessionRef {
  public readonly focusSnapshot: Element | null = document.activeElement;

  protected active = true;
  protected opened = false;
  protected readonly cleanups: (() => void)[] = [];
  protected readonly timers = new Set<ReturnType<typeof setTimeout>>();

  constructor(
    public readonly config: NdwuPopoverConfig,
    protected readonly injector: Injector,
    protected readonly getOverlayElement: () => HTMLElement | null,
    protected readonly notifyFinished: (session: NdwuPopoverSession, state: NdwuPopoverFinishState) => void,
  ) {}

  public isActive(): boolean {
    return this.active;
  }

  public markOpened(): void {
    this.opened = true;
  }

  public wasOpened(): boolean {
    return this.opened;
  }

  public onFinish(cleanup: () => void): void {
    if (!this.active) {
      cleanup();

      return;
    }

    this.cleanups.push(cleanup);
  }

  public afterNextRender(fn: () => void): void {
    const ref = afterNextRender(
      () => {
        if (this.active) {
          fn();
        }
      },
      {injector: this.injector},
    );

    this.onFinish(() => ref.destroy());
  }

  public setTimeout(fn: () => void, ms: number): () => void {
    if (!this.active) {
      return () => {};
    }

    const id = setTimeout(
      () => {
        this.timers.delete(id);

        if (this.active) {
          fn();
        }
      },
      ms,
    );

    this.timers.add(id);

    return () => {
      clearTimeout(id);
      this.timers.delete(id);
    };
  }

  public close(reason: NdwuPopoverDismissReason): void {
    this.finish(reason);
  }

  public finish(reason: NdwuPopoverCloseReason, focusOrigin?: boolean): void {
    if (!this.active) {
      return;
    }

    this.active = false;

    const focused = document.activeElement;
    const focusLost = focused === null || focused === document.body;
    const focusInPane = !focusLost && (this.getOverlayElement()?.contains(focused) ?? false);

    for (const id of this.timers) {
      clearTimeout(id);
    }

    this.timers.clear();

    const errors = this.runCleanups();

    this.notifyFinished(this, {reason, focusOrigin, focusInPane, focusLost});

    if (errors.length > 0) {
      throw errors[0];
    }
  }

  protected runCleanups(): unknown[] {
    const errors: unknown[] = [];

    for (const cleanup of this.cleanups.splice(0).reverse()) {
      try {
        cleanup();
      } catch (error) {
        errors.push(error);
      }
    }

    return errors;
  }
}

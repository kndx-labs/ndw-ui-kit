import {Signal, computed} from '@angular/core';
import type {Observable} from 'rxjs';
import type {NdwuModalController} from './ndwu-modal-controller';
import type {NdwuModalType, NdwuResolvedModalConfig} from './ndwu-modal.types';

// Created by `NdwuModalService`; do not instantiate directly
export class NdwuModalRef<ReturnT = unknown> {
  public readonly id: string;
  public readonly type: NdwuModalType;
  public readonly config: NdwuResolvedModalConfig;
  public readonly afterClosed$: Observable<ReturnT | undefined>;

  /** `false` once closing has started. Read-only: call `close()` instead. */
  public readonly isVisible: Signal<boolean>;
  public readonly title: Signal<string | null>;
  public readonly description: Signal<string | null>;
  public readonly isLoading: Signal<boolean>;

  constructor(
    private readonly controller: NdwuModalController<ReturnT>,
  ) {
    this.id = controller.id;
    this.type = controller.config.type;
    this.config = controller.config;
    this.afterClosed$ = controller.afterClosed$;

    this.isVisible = computed(() => {
      return controller.state() === 'open';
    });

    this.title = controller.title.asReadonly();
    this.description = controller.description.asReadonly();
    this.isLoading = controller.isLoading.asReadonly();
  }

  public setTitle(title: string | null): void {
    this.controller.title.set(title);
  }

  public setDescription(description: string | null): void {
    this.controller.description.set(description);
  }

  public setLoading(isLoading: boolean): void {
    this.controller.isLoading.set(isLoading);
  }

  public close(result?: ReturnT): void {
    this.controller.close(result);
  }

  public canClose(): Observable<boolean> {
    return this.controller.canClose();
  }

  public closeIfAllowed(result?: ReturnT): void {
    this.controller.closeIfAllowed(result);
  }

  /**
   * Sets the guard used by `closeIfAllowed()`, Escape and backdrop click.
   *
   * - Only one check runs at a time; calls made while it is pending are
   *   ignored.
   * - If the handler throws or errors, the modal stays open and the error
   *   goes to Angular `ErrorHandler`.
   * - If the modal is closed with `close()` while a check is pending, the
   *   check is unsubscribed. The handler's teardown must remove any UI it
   *   opened (e.g. close its confirm dialog).
   */
  public setCloseHandler(closeHandler: () => Observable<boolean>): void {
    this.controller.setCloseHandler(closeHandler);
  }

  public updatePosition(): void {
    this.controller.overlayRef.updatePosition();
  }
}

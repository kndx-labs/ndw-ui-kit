import {Observable, Subject, defer, of} from 'rxjs';
import {finalize, take} from 'rxjs/operators';
import {signal} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import type {NdwuModalCloseStrategy} from './close-strategy';
import type {NdwuModalOpenStrategy} from './open-strategy/ndwu-modal-open-strategy';
import type {NdwuModalType, NdwuResolvedModalConfig} from './ndwu-modal.types';

export class NdwuModalRef<ReturnT = unknown> {
  protected readonly afterClosedSub$ = new Subject<ReturnT | undefined>();
  protected closeHandler: () => Observable<boolean> = () => of(true);

  public readonly id: string;
  public readonly type: NdwuModalType;
  public readonly afterClosed$: Observable<ReturnT | undefined> = this.afterClosedSub$.asObservable();
  public readonly isLoading = signal(false);
  public readonly isVisible = signal(true);
  public readonly title = signal<string | null>(null);
  public readonly description = signal<string | null>(null);

  private _openStrategy?: NdwuModalOpenStrategy;

  constructor(
    public config: NdwuResolvedModalConfig,
    public customId: string | undefined,
    private readonly overlayRef: OverlayRef,
    protected closeStrategy: NdwuModalCloseStrategy,
  ) {
    this.type = config.type;
    this.id = customId ?? uniqueId('ndwu-modal-');

    this.title.set(config.title ?? null);
    this.description.set(config.description ?? null);
    this.isLoading.set(config.isLoading ?? false);
  }

  public close(result?: ReturnT): void {
    if (!this.isVisible()) {
      return;
    }

    this.isVisible.set(false);

    this.closeStrategy.close(this.overlayRef)
      .pipe(
        take(1),
        finalize(() => this.finalizeClose(result)),
      )
      .subscribe();
  }

  protected finalizeClose(result?: ReturnT): void {
    this.afterClosedSub$.next(result);
    this.afterClosedSub$.complete();
  }

  public updatePosition(): void {
    this.overlayRef.updatePosition();
  }

  /** @internal */
  public getOverlayRef(): OverlayRef {
    return this.overlayRef;
  }

  public canClose(): Observable<boolean> {
    return defer(() => this.closeHandler())
      .pipe(
        take(1),
      );
  }

  public closeIfAllowed(result?: ReturnT): void {
    this.canClose()
      .subscribe((shouldClose) => {
        if (shouldClose) {
          this.close(result);
        }
      });
  }

  public setCloseHandler(closeHandler: () => Observable<boolean>): void {
    this.closeHandler = closeHandler;
  }

  /** @internal */
  public setCloseStrategy(strategy: NdwuModalCloseStrategy): void {
    this.closeStrategy = strategy;
  }

  /** @internal */
  public setOpenStrategy(strategy: NdwuModalOpenStrategy): void {
    this._openStrategy = strategy;
  }

  /** @internal */
  public getOpenStrategy(): NdwuModalOpenStrategy | undefined {
    return this._openStrategy;
  }
}

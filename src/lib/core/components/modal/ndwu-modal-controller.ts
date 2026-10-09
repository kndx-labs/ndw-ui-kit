import {ErrorHandler, signal} from '@angular/core';
import type {OverlayRef} from '@angular/cdk/overlay';
import {Observable, Subject, Subscription, defer, of} from 'rxjs';
import {catchError, finalize, take} from 'rxjs/operators';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import type {NdwuModalCloseStrategy} from './close-strategy';
import type {NdwuModalOpenStrategy} from './open-strategy';
import type {NdwuResolvedModalConfig} from './ndwu-modal.types';
import {NdwuModalRef} from './ndwu-modal-ref';

export type NdwuModalState = 'open' | 'closing' | 'closed';

// Owns a modal's lifecycle. Internal: not exported from the modal
// `index.ts`. Consumers get `ref`, a read-only facade over this object.
export class NdwuModalController<ReturnT = unknown> {
  protected readonly afterClosedSub$ = new Subject<ReturnT | undefined>();

  protected closeHandler: () => Observable<boolean> = () => {
    return of(true);
  };

  protected pendingCloseRequest: Subscription | null = null;

  public readonly id: string;
  public readonly ref: NdwuModalRef<ReturnT>;
  public readonly afterClosed$: Observable<ReturnT | undefined> = this.afterClosedSub$.asObservable();

  public readonly state = signal<NdwuModalState>('open');
  public readonly title = signal<string | null>(null);
  public readonly description = signal<string | null>(null);
  public readonly isLoading = signal(false);

  public openStrategy: NdwuModalOpenStrategy | null = null;

  constructor(
    public readonly config: NdwuResolvedModalConfig,
    public readonly overlayRef: OverlayRef,
    public closeStrategy: NdwuModalCloseStrategy,
    protected readonly errorHandler: ErrorHandler,
  ) {
    this.id = config.id ?? uniqueId('ndwu-modal-');

    this.title.set(config.title ?? null);
    this.description.set(config.description ?? null);
    this.isLoading.set(config.isLoading ?? false);

    // Last: the facade reads the fields above in its constructor.
    this.ref = new NdwuModalRef<ReturnT>(this);
  }

  public close(result?: ReturnT): void {
    if (this.state() !== 'open') {
      return;
    }

    this.cancelPendingCloseRequest();

    this.state.set('closing');

    this.closeStrategy.close(this.overlayRef)
      .pipe(
        take(1),
        finalize(() => this.finalizeClose(result)),
      )
      .subscribe();
  }

  public canClose(): Observable<boolean> {
    return defer(() => {
      return this.closeHandler();
    })
      .pipe(
        take(1),
      );
  }

  // Single-flight: while the close handler has not answered, further calls
  // are ignored and the first call's `result` wins. A failing handler means
  // "do not close"; the next call runs the handler again.
  public closeIfAllowed(result?: ReturnT): void {
    if (this.state() !== 'open' || this.pendingCloseRequest !== null) {
      return;
    }

    const request = this.canClose()
      .pipe(
        catchError((error: unknown) => {
          this.errorHandler.handleError(error);

          return of(false);
        }),
        finalize(() => {
          this.pendingCloseRequest = null;
        }),
      )
      .subscribe((shouldClose) => {
        if (shouldClose) {
          this.close(result);
        }
      });

    // A synchronous handler (the default `of(true)`) has already completed
    // here and `finalize` has run; storing the closed subscription would
    // block every later call.
    if (!request.closed) {
      this.pendingCloseRequest = request;
    }
  }

  public setCloseHandler(closeHandler: () => Observable<boolean>): void {
    this.closeHandler = closeHandler;
  }

  protected cancelPendingCloseRequest(): void {
    this.pendingCloseRequest?.unsubscribe();

    this.pendingCloseRequest = null;
  }

  protected finalizeClose(result?: ReturnT): void {
    this.state.set('closed');
    this.afterClosedSub$.next(result);
    this.afterClosedSub$.complete();
  }
}

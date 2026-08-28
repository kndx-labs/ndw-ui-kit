import {ChangeDetectionStrategy, Component, Inject, OnInit, signal} from '@angular/core';
import {Observable} from 'rxjs';
import {
  NDWU_MODAL_REF,
  NdwuButtonComponent,
  NdwuModalActionsDirective,
  NdwuModalFooterDirective,
  NdwuModalRef,
} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';

@Component({
  selector: 'app-delayed-close-dialog',
  templateUrl: './delayed-close-dialog.component.html',
  styleUrl: './delayed-close-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
    NdwuModalActionsDirective,
    NdwuModalFooterDirective,
    LocalizePipe,
  ],
})
export class DelayedCloseDialogComponent implements OnInit {
  protected readonly closeDelayEnabled = signal(false);
  protected readonly isClosing = signal(false);
  protected readonly progress = signal(100);

  constructor(
    @Inject(NDWU_MODAL_REF) protected readonly modalRef: NdwuModalRef,
  ) {}

  public ngOnInit(): void {
    this.modalRef.setCloseHandler(
      () =>
        new Observable<boolean>(subscriber => {
          if (this.isClosing()) {
            subscriber.next(false);
            subscriber.complete();

            return;
          }

          if (!this.closeDelayEnabled()) {
            subscriber.next(true);
            subscriber.complete();

            return;
          }

          this.isClosing.set(true);
          this.progress.set(100);

          let elapsed = 0;

          const duration = 2000;
          const step = 100;

          const timer = setInterval(
            () => {
              elapsed += step;
              this.progress.set(Math.max(0, 100 - (elapsed / duration) * 100));

              if (elapsed >= duration) {
                clearInterval(timer);
                subscriber.next(true);
                subscriber.complete();
              }
            },
            step,
          );

          return () => clearInterval(timer);
        }),
    );
  }

  protected toggleDelay(): void {
    this.closeDelayEnabled.update(v => !v);
  }

  protected handleClose(): void {
    this.modalRef.closeIfAllowed();
  }
}

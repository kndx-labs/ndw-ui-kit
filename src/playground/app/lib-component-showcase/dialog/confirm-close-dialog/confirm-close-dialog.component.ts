import {ChangeDetectionStrategy, Component, OnInit, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {
  NDWU_MODAL_REF,
  NdwuButtonComponent,
  NdwuModalActionsDirective,
  NdwuModalFooterDirective,
  NdwuModalRef,
  NdwuModalService,
} from '@ndw-ui-kit/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';

@Component({
  selector: 'app-confirm-close-dialog',
  templateUrl: './confirm-close-dialog.component.html',
  styleUrl: './confirm-close-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
    NdwuModalActionsDirective,
    NdwuModalFooterDirective,
    NdwuLocalizePipe,
  ],
})
export class ConfirmCloseDialogComponent implements OnInit {
  protected readonly modalRef = inject<NdwuModalRef>(NDWU_MODAL_REF);
  protected modalService = inject(NdwuModalService);

  public ngOnInit(): void {
    this.modalRef.setCloseHandler(
      () =>
        new Observable<boolean>((subscriber) => {
          const confirmModalRef = this.modalService.confirm({
            header: 'dialog-showcase.overview.custom-dialogs.confirm-close.confirm-dialog.title',
          });

          const subscription = confirmModalRef.afterClosed$
            .subscribe(shouldClose => {
              subscriber.next(!!shouldClose);
              subscriber.complete();
            });

          // Teardown runs on completion and on cancellation (parent closed
          // with `close()`). After a normal answer the confirm is already
          // closed and this `close()` is a no-op.
          return () => {
            subscription.unsubscribe();
            confirmModalRef.close();
          };
        }),
    );
  }

  protected closeDialog(): void {
    this.modalRef.closeIfAllowed();
  }
}

import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {
  NDWU_MODAL_REF,
  NdwuButtonComponent,
  NdwuModalActionsDirective,
  NdwuModalFooterDirective,
  NdwuModalRef,
  NdwuModalService,
} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';

@Component({
  selector: 'app-confirm-close-dialog',
  templateUrl: './confirm-close-dialog.component.html',
  styleUrl: './confirm-close-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
    NdwuModalActionsDirective,
    NdwuModalFooterDirective,
    LocalizePipe,
  ],
})
export class ConfirmCloseDialogComponent implements OnInit {
  constructor(
    @Inject(NDWU_MODAL_REF) protected readonly modalRef: NdwuModalRef,
    protected modalService: NdwuModalService,
  ) {
  }

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

          return () => {
            subscription.unsubscribe();
          };
        }),
    );
  }

  protected closeDialog(): void {
    this.modalRef.closeIfAllowed();
  }
}

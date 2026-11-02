import {ChangeDetectionStrategy, Component, OnDestroy, Signal, computed, signal, viewChildren} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NDWU_SIZE, type NdwuSize} from '@ndw-ui-kit/core';
import {
  type NdwuFileInputValue,
  NdwuFileItemComponent,
  type NdwuFileProgressUpdate,
  NdwuFileUploadComponent,
  type NdwuTranslationTexts,
} from '@ndw-ui-kit/core/widgets';
import {NdwuFileUploadFieldComponent} from '@ndw-ui-kit/core/form-field';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NdwuSizeFlags} from '@ndw-ui-kit/core/utils';
import {ShowcaseLayoutComponent} from '@app/components';

type ProgressTarget = Pick<NdwuFileUploadComponent, 'updateFileProgress'>;

@Component({
  selector: 'app-file-upload-overview',
  templateUrl: './file-upload-overview.component.html',
  styleUrl: './file-upload-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuFileItemComponent,
    NdwuFileUploadComponent,
    NdwuFileUploadFieldComponent,
    NdwuLocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class FileUploadOverviewComponent implements OnDestroy {
  public readonly SIZE = NDWU_SIZE;

  public readonly fileUploadIsDesktop = signal(true);
  public readonly fileUploadIsMobile: Signal<boolean> = computed(() => !this.fileUploadIsDesktop());
  public readonly fileUploadSizeFlags: NdwuSizeFlags<NdwuSize> = {
    XL: this.fileUploadIsDesktop,
    L: this.fileUploadIsMobile,
  };

  public toggleFileUploadFlags(): void {
    this.fileUploadIsDesktop.update((isDesktop) => !isDesktop);
  }

  public readonly translationTexts: NdwuTranslationTexts = {
    status: {
      uploading: 'file-upload.status.uploading',
      success: 'file-upload.status.success',
      warning: 'file-upload.status.warning',
      error: 'file-upload.status.error',
      canceled: 'file-upload.status.canceled',
      queued: 'file-upload.status.queued',
    },
    header: {
      title: {
        failed: 'file-upload.header.failed',
        completed: 'file-upload.header.completed',
        canceled: 'file-upload.header.canceled',
        inProgress: 'file-upload.header.inProgress',
      },
      subtitle: {
        completed: 'file-upload.header.subtitle.completed',
        canceled: 'file-upload.header.subtitle.canceled',
        inProgress: 'file-upload.header.subtitle.inProgress',
      },
      expand: 'file-upload.header.expand',
      collapse: 'file-upload.header.collapse',
      cancelAll: 'file-upload.header.cancelAll',
      retry: 'file-upload.header.retry',
    },
    action: {
      remove: 'file-upload.actions.remove',
      cancel: 'file-upload.actions.cancel',
      retry: 'file-upload.actions.retry',
    },
    dropzone: {
      title: 'file-upload.dropzone.title',
      hint: 'file-upload.dropzone.hint',
      browse: 'file-upload.dropzone.browse',
    },
    validation: {
      tooLarge: 'file-upload.validation.tooLarge',
    },
  };

  public readonly fileItemFiles: NdwuFileInputValue[] = [
    {
      id: 'item-queued',
      name: 'Queued_for_later.docx',
      size: 1024 * 1024 * 1.2,
      progress: 0,
      status: 'queued',
    },
    {
      id: 'item-warning',
      name: 'Warning_state_example.bin',
      size: 1024 * 1024 * 1.5,
      progress: 100,
      status: 'warning',
    },
    {
      id: 'item-canceled',
      name: 'Canceled_by_user.txt',
      size: 1024 * 12,
      progress: 0,
      status: 'canceled',
    },
  ];

  public readonly fileItemBarFiles: NdwuFileInputValue[] = [
    {
      id: 'bar-uploading',
      name: 'Document_in_progress.pdf',
      size: 1024 * 1024 * 2.5,
      progress: 45,
      status: 'uploading',
    },
    {
      id: 'bar-success',
      name: 'Successful_upload_final.png',
      size: 1024 * 512,
      progress: 100,
      status: 'success',
    },
    {
      id: 'bar-error',
      name: 'Validation_error_too_large.zip',
      size: 1024 * 1024 * 15,
      progress: 0,
      status: 'error',
      error: 'file-upload.validation.tooLarge',
    },
    {
      id: 'bar-error-retryable',
      name: 'Server_error_connection_lost.cfg',
      size: 1024 * 4,
      progress: 30,
      status: 'error',
      error: 'file-upload.status.error',
      isRetryable: true,
    },
  ];

  public readonly mixedStateFiles: NdwuFileInputValue[] = [
    {
      id: 'mixed-uploading',
      name: 'Document_in_progress.pdf',
      size: 1024 * 1024 * 2.5,
      progress: 45,
      status: 'uploading',
    },
    {
      id: 'mixed-success',
      name: 'Successful_upload_final.png',
      size: 1024 * 512,
      progress: 100,
      status: 'success',
    },
    {
      id: 'mixed-error',
      name: 'Validation_error_too_large.zip',
      size: 1024 * 1024 * 15,
      progress: 0,
      status: 'error',
      error: 'file-upload.validation.tooLarge',
    },
    {
      id: 'mixed-error-retryable',
      name: 'Server_error_connection_lost.cfg',
      size: 1024 * 4,
      progress: 30,
      status: 'error',
      error: 'file-upload.status.error',
      isRetryable: true,
    },
    {
      id: 'mixed-warning',
      name: 'Warning_state_example.bin',
      size: 1024 * 1024 * 1.5,
      progress: 100,
      status: 'warning',
    },
    {
      id: 'mixed-canceled',
      name: 'Canceled_by_user.txt',
      size: 1024 * 12,
      progress: 0,
      status: 'canceled',
    },
    {
      id: 'mixed-queued',
      name: 'Queued_for_later.docx',
      size: 1024 * 1024 * 1.2,
      progress: 0,
      status: 'queued',
    },
  ];

  protected readonly singleUploadRefs = viewChildren<NdwuFileUploadComponent>('singleUploadRef');
  protected readonly multipleUploadRefs = viewChildren<NdwuFileUploadComponent>('multipleUploadRef');
  protected readonly cvaUploadRefs = viewChildren<NdwuFileUploadFieldComponent>('cvaUploadRef');

  public readonly fileUploadCvaForm = new FormGroup({
    files: new FormControl<NdwuFileInputValue[]>([], {nonNullable: true}),
  });

  protected readonly cvaValue = toSignal(this.fileUploadCvaForm.controls.files.valueChanges, {initialValue: []});
  protected readonly cvaStatuses = computed(() => {
    const statuses = this.cvaValue().map(f => f.status);

    return statuses.length > 0 ? statuses.join(', ') : '—';
  });

  private readonly uploadIntervals = new Map<string, ReturnType<typeof setInterval>>();

  protected onUploadRequestSingle(files: NdwuFileInputValue[]): void {
    this.startSims(files, this.singleUploadRefs());
  }

  protected onUploadRequestMultiple(files: NdwuFileInputValue[]): void {
    this.startSims(files, this.multipleUploadRefs());
  }

  protected onUploadRequestCva(files: NdwuFileInputValue[]): void {
    this.startSims(files, this.cvaUploadRefs());
  }

  protected onCancelRequest(files: NdwuFileInputValue[]): void {
    files.forEach(f => this.stopSim(f.id));
  }

  protected setCvaValue(): void {
    this.stopCvaSims();
    this.fileUploadCvaForm.controls.files.setValue([{
      id: 'cva-preset',
      name: 'Preset_from_form.pdf',
      size: 1024 * 300,
      progress: 100,
      status: 'success',
    }]);
  }

  protected resetCvaForm(): void {
    this.stopCvaSims();
    this.fileUploadCvaForm.reset();
  }

  protected markCvaPristine(): void {
    this.fileUploadCvaForm.markAsPristine();
  }

  private startSims(files: NdwuFileInputValue[], targets: readonly ProgressTarget[]): void {
    files.forEach(f => this.startSimForFile(f, targets));
  }

  private startSimForFile(file: NdwuFileInputValue, targets: readonly ProgressTarget[]): void {
    const update = (u: NdwuFileProgressUpdate): void => targets.forEach(t => t.updateFileProgress(file.id, u));
    let progress = file.progress;

    update({status: 'uploading', progress});

    const interval = setInterval(() => {
      progress = Math.min(100, progress + Math.random() * 20);

      if (progress >= 100) {
        this.stopSim(file.id);
        update({progress: 100, status: 'success'});
      } else {
        update({progress: Math.round(progress), status: 'uploading'});
      }
    }, 300);

    this.uploadIntervals.set(file.id, interval);
  }

  private stopCvaSims(): void {
    this.fileUploadCvaForm.controls.files.value.forEach(f => this.stopSim(f.id));
  }

  private stopSim(fileId: string): void {
    const interval = this.uploadIntervals.get(fileId);

    if (interval) {
      clearInterval(interval);
      this.uploadIntervals.delete(fileId);
    }
  }

  public ngOnDestroy(): void {
    this.uploadIntervals.forEach(iv => clearInterval(iv));
    this.uploadIntervals.clear();
  }
}

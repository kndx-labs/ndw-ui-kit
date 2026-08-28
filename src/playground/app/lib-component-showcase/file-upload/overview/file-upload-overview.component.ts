import {ChangeDetectionStrategy, Component, OnDestroy, Signal, computed, signal, viewChild} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  type FileInputValue,
  NdwuFileItemComponent,
  NdwuFileUploadComponent,
  SIZE,
  type Size,
  type TranslationTexts,
} from '@ndw-ui-kit/core';
import {NdwuFileUploadFieldComponent} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NdwuSizeFlags} from '@ndw-ui-kit/core/utils';
import {ShowcaseLayoutComponent} from '@app/components';

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
    LocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class FileUploadOverviewComponent implements OnDestroy {
  public readonly SIZE = SIZE;

  public readonly fileUploadIsDesktop = signal(true);
  public readonly fileUploadIsMobile: Signal<boolean> = computed(() => !this.fileUploadIsDesktop());
  public readonly fileUploadSizeFlags: NdwuSizeFlags<Size> = {
    XL: this.fileUploadIsDesktop,
    L: this.fileUploadIsMobile,
  };

  public toggleFileUploadFlags(): void {
    this.fileUploadIsDesktop.update((isDesktop) => !isDesktop);
  }

  public readonly translationTexts: TranslationTexts = {
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

  public readonly fileItemFiles: FileInputValue[] = [
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

  public readonly fileItemBarFiles: FileInputValue[] = [
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

  public readonly mixedStateFiles: FileInputValue[] = [
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

  protected singleUploadRef = viewChild<NdwuFileUploadComponent>('singleUploadRef');
  protected multipleUploadRef = viewChild<NdwuFileUploadComponent>('multipleUploadRef');
  protected cvaUploadRef = viewChild<NdwuFileUploadFieldComponent>('cvaUploadRef');

  public readonly fileUploadCvaForm = new FormGroup({
    files: new FormControl<FileInputValue[]>([], {nonNullable: true}),
  });

  private readonly uploadIntervals = new Map<string, ReturnType<typeof setInterval>>();

  protected onUploadRequestSingle(files: FileInputValue[]): void {
    this.startSimUploads(files, this.singleUploadRef());
  }

  protected onUploadRequestMultiple(files: FileInputValue[]): void {
    this.startSimUploads(files, this.multipleUploadRef());
  }

  protected onUploadRequestCva(files: FileInputValue[]): void {
    if (!this.cvaUploadRef()) {
      return;
    }

    files.filter(f => f.status === 'queued').forEach(f => {
      let progress = f.progress ?? 0;

      const cvaUploadRef = this.cvaUploadRef();

      if (!cvaUploadRef) {
        return;
      }

      cvaUploadRef.updateFileProgress(f.id, {status: 'uploading', progress});

      const interval = setInterval(
        () => {
          progress += Math.random() * 20;

          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            this.uploadIntervals.delete(f.id);
            cvaUploadRef.updateFileProgress(f.id, {progress: 100, status: 'success'});
          } else {
            cvaUploadRef.updateFileProgress(f.id, {progress: Math.round(progress), status: 'uploading'});
          }
        },
        300,
      );

      this.uploadIntervals.set(f.id, interval);
    });
  }

  protected onFilesChangedCva(files: FileInputValue[]): void {
    this.syncFilesState(files);
  }

  protected onFilesChangedSingle(files: FileInputValue[]): void {
    this.syncFilesState(files);
  }

  protected onFilesChangedMultiple(files: FileInputValue[]): void {
    this.syncFilesState(files);
  }

  private startSimUploads(files: FileInputValue[], comp?: NdwuFileUploadComponent): void {
    if (!comp) { return; }

    files.filter(f => f.status === 'queued').forEach(f => this.startSimForFile(f, comp));
  }

  private startSimForFile(file: FileInputValue, comp: NdwuFileUploadComponent): void {
    let progress = file.progress ?? 0;

    // Ensure the component shows uploading state immediately
    comp.updateFileProgress(file.id, {status: 'uploading', progress});

    const interval = setInterval(() => {
      progress += Math.random() * 20;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        this.uploadIntervals.delete(file.id);
        comp.updateFileProgress(file.id, {progress: 100, status: 'success'});
      } else {
        comp.updateFileProgress(file.id, {progress: Math.round(progress), status: 'uploading'});
      }
    }, 300);

    this.uploadIntervals.set(file.id, interval);
  }

  private syncFilesState(files: FileInputValue[]): void {
    const currentIds = new Set(files.map(f => f.id));

    // Clear intervals for files that were removed or reached terminal states
    Array.from(this.uploadIntervals.keys()).forEach(id => {
      if (!currentIds.has(id)) {
        const iv = this.uploadIntervals.get(id);

        if (iv) {
          clearInterval(iv);
          this.uploadIntervals.delete(id);
        }
      }
    });

    // Also clear intervals for canceled/success files
    files.forEach(f => {
      if (f.status === 'canceled' || f.status === 'success') {
        const iv = this.uploadIntervals.get(f.id);

        if (iv) {
          clearInterval(iv);
          this.uploadIntervals.delete(f.id);
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.uploadIntervals.forEach(iv => clearInterval(iv));
    this.uploadIntervals.clear();
  }
}

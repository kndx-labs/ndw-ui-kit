import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {deepMerge, uniqueId} from '@ndw-ui-kit/core/utils';
import {SIZE} from '../../../shared.types';
import {NdwuAdaptiveSizeDirective, NdwuResizeObserverDirective, NdwuSizeDirective} from '../../directives';
import {NDWU_SIZE_TOKEN} from '../../tokens';
import {NDWU_INTERACTION_FOCUS_TYPE, NdwuInteractionRegistry} from '../interaction';
import {NdwuFileDropzoneComponent} from './ndwu-file-dropzone.component';
import {NdwuFileItemComponent} from './ndwu-file-item.component';
import {NdwuFileUploadHeaderComponent} from './ndwu-file-upload-header.component';
import type {FileInputValue, TranslationTexts} from './ndwu-file-upload.types';

const COMPACT_WIDTH_THRESHOLD = 510;

@Component({
  selector: 'ndwu-file-upload',
  templateUrl: './ndwu-file-upload.component.html',
  styleUrl: './ndwu-file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuFileDropzoneComponent,
    NdwuFileItemComponent,
    NdwuFileUploadHeaderComponent,
  ],
  hostDirectives: [
    {
      directive: NdwuSizeDirective,
      inputs: ['ndwuSize: size'],
    },
    {
      directive: NdwuAdaptiveSizeDirective,
      inputs: ['ndwuAdaptiveSize: adaptiveSize'],
    },
    NdwuResizeObserverDirective,
  ],
  providers: [
    {
      provide: NDWU_SIZE_TOKEN,
      useFactory: () => {
        const component = inject(NdwuFileUploadComponent);

        return () => component.effectiveSize();
      },
    },
  ],
})
export class NdwuFileUploadComponent implements OnInit {
  private readonly sizeSvc = inject(NdwuSizeDirective);
  private readonly adaptiveSvc = inject(NdwuAdaptiveSizeDirective);
  private readonly resizeSvc = inject(NdwuResizeObserverDirective);
  private readonly parentSize = inject(NDWU_SIZE_TOKEN, {optional: true, skipSelf: true});

  public readonly effectiveSize = computed(() => {
    const adaptiveSize = this.adaptiveSvc.adaptiveSize();

    if (adaptiveSize) {
      return adaptiveSize;
    }

    const explicitSize = this.sizeSvc.size() ?? this.parentSize?.();

    if (explicitSize) {
      return explicitSize;
    }

    const width = this.resizeSvc.width();

    return this.resizeSvc.measured() && width > 0 && width < COMPACT_WIDTH_THRESHOLD
      ? SIZE.L
      : SIZE.XL;
  });

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly registry = inject(NdwuInteractionRegistry);
  private readonly DEFAULT_TEXTS: TranslationTexts = {
    status: {
      uploading: 'Uploading...',
      success: 'Uploaded',
      warning: 'Warning',
      error: 'Upload failed. Check your connection and try again.',
      canceled: 'Canceled',
      queued: 'Queued',
    },
    header: {
      title: {
        failed: 'Some items failed',
        completed: 'Done',
        canceled: 'Canceled',
        inProgress: 'In progress',
      },
      subtitle: {
        completed: '{{completed}} of {{total}} files completed',
        canceled: '{{total}} files canceled',
        inProgress: '{{progress}}% uploaded',
      },
      expand: 'Expand upload list',
      collapse: 'Collapse upload list',
      cancelAll: 'Cancel all',
      retry: 'Retry',
    },
    action: {
      remove: 'Remove',
      cancel: 'Cancel',
      retry: 'Retry',
    },
    dropzone: {
      title: 'Upload file',
      hint: 'Drag and drop a file here or',
      browse: 'Browse file',
    },
    validation: {
      tooLarge: 'File exceeds size limit',
    },
  };

  public readonly multiple = input(true, {transform: booleanAttribute});
  public readonly accept = input<string>('');
  public readonly maxSizeMB = input<number>(5);
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly initialFiles = input<FileInputValue[]>([]);
  public readonly translationTexts = input<TranslationTexts>();

  public readonly isCollapsed = signal(false);

  public readonly filesChange = output<FileInputValue[]>();
  public readonly uploadRequest = output<FileInputValue[]>();
  public readonly focused = output<void>();
  public readonly blurred = output<void>();

  private readonly fileList = signal<FileInputValue[]>([]);
  private readonly registryId = uniqueId('ndwu-file-upload-');
  private readonly focusedState = signal(false);

  private readonly mergedTexts = computed(() => deepMerge(this.DEFAULT_TEXTS, this.translationTexts() ?? {}));

  protected readonly dropzoneTexts = computed(() => this.mergedTexts().dropzone);
  protected readonly statusTexts = computed(() => this.mergedTexts().status);
  protected readonly actionTexts = computed(() => this.mergedTexts().action);
  protected readonly headerTitleTexts = computed(() => this.mergedTexts().header);
  protected readonly headerSubtitleTexts = computed(() => this.mergedTexts().header);
  protected readonly headerActionTexts = computed(() => this.mergedTexts().header);
  protected readonly headerToggleTexts = computed(() => this.mergedTexts().header);
  protected readonly validationTooLargeText = computed(() => {
    return this.mergedTexts().validation?.tooLarge ?? 'File exceeds size limit';
  });

  public readonly files = computed(() => this.fileList());

  private updateFiles(transform: (files: FileInputValue[]) => FileInputValue[]): void {
    this.fileList.update(files => {
      const updated = transform(files);

      this.filesChange.emit(updated);

      return updated;
    });
  }

  public updateFileProgress(fileId: string, updates: Partial<FileInputValue>): void {
    this.updateFiles(files =>
      files.map(f => {
        if (f.id !== fileId) {
          return f;
        }

        const merged = {...f, ...updates};

        if (f.status === 'error' && updates.status && updates.status !== 'error') {
          delete (merged as Partial<FileInputValue>).error;
        }

        return merged;
      })
    );
  }

  constructor() {
    // sync `focus` state with `NdwuInteractionRegistry`
    effect(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.FILE_UPLOAD, this.registryId, this.focusedState());
    });

    this.destroyRef.onDestroy(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.FILE_UPLOAD, this.registryId, false);
    });
  }

  public ngOnInit(): void {
    const initial = this.initialFiles();

    if (initial?.length > 0) {
      this.fileList.set([...initial]);
    }
  }

  @HostListener('focusin')
  protected onFocusIn(): void {
    if (this.focusedState()) {
      return;
    }

    this.focusedState.set(true);
    this.focused.emit();
  }

  @HostListener('focusout', ['$event'])
  protected onFocusOut(event: FocusEvent): void {
    const nextFocused = event.relatedTarget;

    if (nextFocused instanceof Node && this.hostRef.nativeElement.contains(nextFocused)) {
      return;
    }

    if (!this.focusedState()) {
      return;
    }

    this.focusedState.set(false);
    this.blurred.emit();
  }

  public readonly hasFiles = computed(() => this.fileList().length > 0);

  protected onFilesSelected(fileList: File[]): void {
    const currentFiles = this.fileList();
    const newFiles: FileInputValue[] = fileList.map(file => {
      return {
        id: uniqueId('file-'),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'queued' as const,
        file,
      };
    });

    let validFiles = newFiles;

    if (this.maxSizeMB() > 0) {
      const maxBytes = this.maxSizeMB() * 1024 * 1024;
      const tooLargeError = this.validationTooLargeText();

      validFiles = newFiles.map(f => {
        if ((f.file?.size ?? 0) > maxBytes) {
          return {...f, status: 'error' as const, error: tooLargeError};
        }

        return f;
      });
    }

    const finalFiles = this.multiple()
      ? [...currentFiles, ...validFiles]
      : validFiles.slice(0, 1);

    this.updateFiles(() => finalFiles);

    this.uploadRequest.emit(finalFiles.filter(f => f.status === 'queued'));
  }

  protected onFileRemove(fileId: string): void {
    const currentFiles = this.fileList();
    const updatedFiles = currentFiles.filter(f => f.id !== fileId);

    this.updateFiles(() => updatedFiles);
  }

  protected onFileRetry(fileId: string): void {
    const currentFiles = this.fileList();
    const updatedFiles = currentFiles.map(f => {
      if (f.id === fileId && f.status === 'error') {
        const {error: _, ...rest} = f;

        return {...rest, status: 'queued' as const, progress: 0};
      }

      return f;
    });

    this.updateFiles(() => updatedFiles);

    this.uploadRequest.emit(updatedFiles.filter(f => f.id === fileId));
  }

  protected onFileCancel(fileId: string): void {
    const currentFiles = this.fileList();
    const updatedFiles = currentFiles.map(f => {
      if (f.id === fileId && f.status === 'uploading') {
        return {...f, status: 'canceled' as const};
      }

      return f;
    });

    this.updateFiles(() => updatedFiles);
  }

  protected onCancelAll(): void {
    const currentFiles = this.fileList();
    const updatedFiles = currentFiles.map(f => {
      if (f.status === 'uploading' || f.status === 'queued') {
        return {...f, status: 'canceled' as const};
      }

      return f;
    });

    this.updateFiles(() => updatedFiles);
  }

  protected onRetryAll(): void {
    const currentFiles = this.fileList();
    const updatedFiles = currentFiles.map(f => {
      if (f.status === 'error') {
        const {error: _, ...rest} = f;

        return {...rest, status: 'queued' as const, progress: 0};
      }

      return f;
    });

    this.updateFiles(() => updatedFiles);
    this.uploadRequest.emit(updatedFiles.filter(f => f.status === 'queued'));
  }
}

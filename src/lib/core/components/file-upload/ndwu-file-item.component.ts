import {ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input, output} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {formatSize, shortenFileName} from '@ndw-ui-kit/core/utils';
import {NDWU_ICON_NAME, type NdwuIconName} from '../../../icon-names';
import {NDWU_SIZE} from '../../../shared.types';
import {NdwuResizeObserverDirective, NdwuSizeDirective} from '../../directives';
import {NDWU_SIZE_TOKEN} from '../../tokens';
import {NdwuButtonComponent} from '../button/button/ndwu-button.component';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {NDWU_PROGRESS_BAR_COLOR, NdwuProgressBarComponent} from '../progress-bar/ndwu-progress-bar.component';
import type {NdwuFileInputValue, NdwuTranslationTexts} from './ndwu-file-upload.types';

const COMPACT_WIDTH_THRESHOLD = 360;

@Component({
  selector: 'ndwu-file-item',
  templateUrl: './ndwu-file-item.component.html',
  styleUrl: './ndwu-file-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuButtonComponent,
    NdwuIconComponent,
    NdwuProgressBarComponent,
  ],
  hostDirectives: [
    {
      directive: NdwuSizeDirective,
      inputs: ['ndwuSize: size'],
    },
    NdwuResizeObserverDirective,
  ],
  providers: [
    {
      provide: NDWU_SIZE_TOKEN,
      useFactory: () => {
        const component = inject(NdwuFileItemComponent);

        return () => component.effectiveSize();
      },
    },
  ],
})
export class NdwuFileItemComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  private readonly resizeSvc = inject(NdwuResizeObserverDirective);
  private readonly parentSize = inject(NDWU_SIZE_TOKEN, {optional: true, skipSelf: true});
  protected readonly ICON_NAME = NDWU_ICON_NAME;

  public readonly effectiveSize = computed(() => {
    const explicitSize = this.sizeSvc.size() ?? this.parentSize?.();

    if (explicitSize) {
      return explicitSize;
    }

    const width = this.resizeSvc.width();

    return this.resizeSvc.measured() && width > 0 && width < COMPACT_WIDTH_THRESHOLD
      ? NDWU_SIZE.L
      : NDWU_SIZE.XL;
  });

  private readonly DEFAULT_STATUS_TEXTS = {
    uploading: 'Uploading...',
    success: 'Uploaded',
    warning: 'Warning',
    error: 'Upload failed. Check your connection and try again.',
    canceled: 'Canceled',
    queued: 'Queued',
  };

  private readonly DEFAULT_ACTION_TEXTS = {
    remove: 'Remove',
    cancel: 'Cancel',
    retry: 'Retry',
  };

  public readonly file = input.required<NdwuFileInputValue>();
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly statusTexts = input<NdwuTranslationTexts['status']>();
  public readonly actionTexts = input<NdwuTranslationTexts['action']>();

  public readonly remove = output<string>();
  public readonly retry = output<string>();
  public readonly fileCancel = output<string>();

  protected readonly effectiveStatusTexts = computed(() => ({
    ...this.DEFAULT_STATUS_TEXTS,
    ...this.statusTexts(),
  }));

  protected readonly effectiveActionTexts = computed(() => ({
    ...this.DEFAULT_ACTION_TEXTS,
    ...this.actionTexts(),
  }));

  protected readonly rootClass = computed(() => {
    const classes = [
      'ndwu-file-item',
      `ndwu-file-item--${this.effectiveSize() === NDWU_SIZE.XL ? 'XL' : 'L'}`,
      `ndwu-file-item--${this.file().status}`,
    ];

    if (this.disabled()) {
      classes.push('ndwu-file-item--disabled');
    }

    return classes.join(' ');
  });

  protected readonly hasProgressBar = computed(() => {
    const status = this.file().status;

    return status === 'uploading' || status === 'success' || status === 'error';
  });

  protected readonly progressColor = computed(() => {
    const status = this.file().status;

    switch (status) {
      case 'success':
        return NDWU_PROGRESS_BAR_COLOR.SUCCESS;
      case 'error':
        return NDWU_PROGRESS_BAR_COLOR.DANGER;
      default:
        return NDWU_PROGRESS_BAR_COLOR.PRIMARY;
    }
  });

  protected readonly statusIcon = computed<NdwuIconName>(() => {
    const status = this.file().status;

    switch (status) {
      case 'uploading':
        return NDWU_ICON_NAME.LOADING_L;
      case 'success':
        return NDWU_ICON_NAME.SUCCESS_L;
      case 'error':
        return NDWU_ICON_NAME.ERROR_L;
      case 'warning':
        return NDWU_ICON_NAME.WARNING_L;
      case 'canceled':
        return NDWU_ICON_NAME.CLOSE_L;
      default:
        return NDWU_ICON_NAME.FILE_L;
    }
  });

  protected readonly statusText = computed(() => {
    const status = this.file().status;
    const texts = this.effectiveStatusTexts();

    return (texts as Record<string, string>)[status] ?? '';
  });

  protected readonly formattedSize = computed(() => formatSize(this.file().size));

  protected readonly displayFileName = computed(() => {
    const value = this.effectiveSize() === NDWU_SIZE.XL ? 40 : 30;

    return shortenFileName(this.file().name, value);
  });

  protected onRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit(this.file().id);
  }

  protected onRetry(event: Event): void {
    event.stopPropagation();
    this.retry.emit(this.file().id);
  }

  protected onCancel(event: Event): void {
    event.stopPropagation();
    this.fileCancel.emit(this.file().id);
  }
}

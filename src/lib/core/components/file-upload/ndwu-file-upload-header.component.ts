import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ICON_NAME} from '../../../icon-names';
import {SIZE} from '../../../shared.types';
import {NdwuSizeDirective} from '../../directives';
import {NdwuButtonComponent} from '../button/button/ndwu-button.component';
import {NdwuProgressBarComponent, PROGRESS_BAR_COLOR} from '../progress-bar/ndwu-progress-bar.component';
import type {NdwuFileInputValue, NdwuTranslationTexts} from './ndwu-file-upload.types';

@Component({
  selector: 'ndwu-file-upload-header',
  templateUrl: './ndwu-file-upload-header.component.html',
  styleUrl: './ndwu-file-upload-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuButtonComponent,
    NdwuProgressBarComponent,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuFileUploadHeaderComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly ICON_NAME = ICON_NAME;

  private readonly DEFAULT_HEADER_TEXTS = {
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
  };

  public readonly files = input.required<NdwuFileInputValue[]>();
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly headerTitleTexts = input<NdwuTranslationTexts['header']>();
  public readonly headerSubtitleTexts = input<NdwuTranslationTexts['header']>();
  public readonly headerActionTexts = input<NdwuTranslationTexts['header']>();
  public readonly headerToggleTexts = input<NdwuTranslationTexts['header']>();

  public readonly cancelAll = output<void>();
  public readonly retryAll = output<void>();

  public readonly isCollapsed = model(false);

  protected readonly effectiveHeaderTitleTexts = computed(() => ({
    ...this.DEFAULT_HEADER_TEXTS.title,
    ...this.headerTitleTexts()?.title,
  }));

  protected readonly effectiveHeaderSubtitleTexts = computed(() => ({
    ...this.DEFAULT_HEADER_TEXTS.subtitle,
    ...this.headerSubtitleTexts()?.subtitle,
  }));

  protected readonly effectiveHeaderActionTexts = computed(() => ({
    cancelAll: this.headerActionTexts()?.cancelAll ?? this.DEFAULT_HEADER_TEXTS.cancelAll,
    retry: this.headerActionTexts()?.retry ?? this.DEFAULT_HEADER_TEXTS.retry,
  }));

  protected readonly effectiveHeaderToggleTexts = computed(() => ({
    expand: this.headerToggleTexts()?.expand ?? this.DEFAULT_HEADER_TEXTS.expand,
    collapse: this.headerToggleTexts()?.collapse ?? this.DEFAULT_HEADER_TEXTS.collapse,
  }));

  protected readonly rootClass = computed(() => {
    const classes = [
      'ndwu-file-upload-header',
      `ndwu-file-upload-header--${this.sizeSvc.effectiveSize() === SIZE.XL ? 'XL' : 'L'}`,
    ];

    return classes.join(' ');
  });

  protected readonly hasUploading = computed(() => {
    return this.files().some(f => f.status === 'uploading');
  });

  protected readonly hasErrors = computed(() => {
    return this.files().some(f => f.status === 'error');
  });

  protected readonly hasWarnings = computed(() => {
    return this.files().some(f => f.status === 'warning');
  });

  protected readonly allDone = computed(() => {
    return this.files().length > 0
      && this.files().every(f => f.status === 'success' || f.status === 'warning');
  });

  protected readonly allCanceled = computed(() => {
    return this.files().length > 0 && this.files().every(f => f.status === 'canceled');
  });

  protected readonly overallProgress = computed(() => {
    const files = this.files();

    if (files.length === 0) {
      return 0;
    }

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    if (totalSize === 0) {
      return 0;
    }

    const weightedProgress = files.reduce(
      (sum, f) => {
        return sum + (f.progress / 100) * f.size;
      },
      0,
    );

    return Math.round((weightedProgress / totalSize) * 100);
  });

  protected readonly progressColor = computed(() => {
    if (this.allDone() && this.hasWarnings()) {
      return PROGRESS_BAR_COLOR.WARNING;
    }

    if (this.allDone()) {
      return PROGRESS_BAR_COLOR.SUCCESS;
    }

    if (this.hasErrors()) {
      return PROGRESS_BAR_COLOR.DANGER;
    }

    if (this.hasWarnings()) {
      return PROGRESS_BAR_COLOR.WARNING;
    }

    if (this.allCanceled()) {
      return PROGRESS_BAR_COLOR.PRIMARY;
    }

    return PROGRESS_BAR_COLOR.PRIMARY;
  });

  protected readonly headerTitle = computed(() => {
    const titleTexts = this.effectiveHeaderTitleTexts();

    if (this.hasErrors()) {
      return titleTexts.failed;
    }

    if (this.allDone()) {
      return titleTexts.completed;
    }

    if (this.allCanceled()) {
      return titleTexts.canceled;
    }

    return titleTexts.inProgress;
  });

  protected readonly headerSubtitle = computed(() => {
    const files = this.files();
    const total = files.length;
    const completed = files.filter(f => f.status === 'success' || f.status === 'warning').length;
    const subtitleTexts = this.effectiveHeaderSubtitleTexts();

    if (this.hasErrors() || this.allDone()) {
      return {key: subtitleTexts.completed, params: {completed, total}};
    }

    if (this.allCanceled()) {
      return {key: subtitleTexts.canceled, params: {total}};
    }

    return {key: subtitleTexts.inProgress, params: {progress: this.overallProgress()}};
  });

  protected readonly toggleAriaLabel = computed(() => {
    const toggleTexts = this.effectiveHeaderToggleTexts();

    return this.isCollapsed() ? toggleTexts.expand : toggleTexts.collapse;
  });

  protected onToggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  protected onCancelAll(): void {
    this.cancelAll.emit();
  }

  protected onRetryAll(): void {
    this.retryAll.emit();
  }
}

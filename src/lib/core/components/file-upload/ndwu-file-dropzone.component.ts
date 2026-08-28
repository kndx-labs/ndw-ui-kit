import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ICON_NAME} from '../../../icon-names';
import {PICTOGRAM_NAME} from '../../../pictogram-names';
import type {PictogramVariant} from '../../../pictogram-presets';
import {SIZE} from '../../../shared.types';
import {NdwuSizeDirective} from '../../directives';
import {NdwuButtonComponent} from '../button/button/ndwu-button.component';
import {NdwuPictogramComponent} from '../pictogram/ndwu-pictogram.component';
import type {TranslationTexts} from './ndwu-file-upload.types';

@Component({
  selector: 'ndwu-file-dropzone',
  templateUrl: './ndwu-file-dropzone.component.html',
  styleUrl: './ndwu-file-dropzone.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuButtonComponent,
    NdwuPictogramComponent,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuFileDropzoneComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly ICON_NAME = ICON_NAME;

  private readonly DEFAULT_DROPZONE_TEXTS = {
    title: 'Upload file',
    hint: 'Drag and drop a file here or',
    browse: 'Browse file',
  };

  public readonly accept = input<string>('');
  public readonly multiple = input(true, {transform: booleanAttribute});
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly dropzoneTexts = input<TranslationTexts['dropzone']>();

  public readonly filesSelected = output<File[]>();

  protected readonly effectiveTexts = computed(() => {
    const inputTexts = this.dropzoneTexts();

    return {
      ...this.DEFAULT_DROPZONE_TEXTS,
      ...inputTexts,
    };
  });

  protected readonly effectivePictogramName = computed(() => {
    const isXl = this.sizeSvc.effectiveSize() === 'XL';

    if (this.disabled()) {
      return isXl
        ? PICTOGRAM_NAME.PICTOGRAM_UPLOAD_DISABLED_XL
        : PICTOGRAM_NAME.PICTOGRAM_UPLOAD_DISABLED_L;
    }

    return isXl
      ? PICTOGRAM_NAME.PICTOGRAM_UPLOAD_XL
      : PICTOGRAM_NAME.PICTOGRAM_UPLOAD_L;
  });

  protected readonly effectivePictogramVariant = computed<PictogramVariant>(() => {
    return this.disabled() ? 'DISABLED' : 'DEFAULT';
  });

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  public readonly isDragOver = signal(false);

  protected readonly resolvedSize = computed(() => {
    return this.sizeSvc.effectiveSize() === SIZE.XL ? SIZE.XL : SIZE.L;
  });

  protected readonly rootClass = computed(() => {
    const classes = [
      'ndwu-file-dropzone',
      `ndwu-file-dropzone--${this.resolvedSize()}`,
    ];

    if (this.isDragOver()) {
      classes.push('ndwu-file-dropzone--drag-over');
    }

    if (this.disabled()) {
      classes.push('ndwu-file-dropzone--disabled');
    }

    return classes.join(' ');
  });

  @HostListener('dragover', ['$event'])
  public onDragOver(event: DragEvent): void {
    event.preventDefault();

    if (!this.disabled()) {
      this.isDragOver.set(true);
    }
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);

    if (this.disabled()) {
      return;
    }

    const files = this.getFilesFromEvent(event);

    if (files.length > 0) {
      this.filesSelected.emit(files);
    }
  }

  public onInputChange(event: Event): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0) {
      const files = Array.from(fileInput.files);

      this.filesSelected.emit(files);

      fileInput.value = '';
    }
  }

  public openFilePicker(event: KeyboardEvent | MouseEvent): void {
    event.preventDefault();

    if (!this.disabled()) {
      this.inputRef()?.nativeElement.click();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.openFilePicker(event);
    }
  }

  protected onClick(event: MouseEvent): void {
    this.openFilePicker(event);
  }

  private getFilesFromEvent(event: DragEvent): File[] {
    if (!event.dataTransfer?.files) {
      return [];
    }

    const files = Array.from(event.dataTransfer.files);

    if (!this.multiple()) {
      return files.slice(0, 1);
    }

    return files;
  }
}

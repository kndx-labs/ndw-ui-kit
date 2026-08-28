import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {
  type FileInputValue,
  NdwuFileUploadComponent,
  NdwuSizeDirective,
  type TranslationTexts,
} from '@ndw-ui-kit/core';
import {FormFieldBase} from '../../classes/form-field-base';
import {setValueAccessor} from '../../form-field.utils';

@Component({
  selector: 'ndwu-file-upload-field',
  templateUrl: './ndwu-file-upload-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuFileUploadComponent,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuFileUploadFieldComponent extends FormFieldBase<FileInputValue[]> {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly multiple = input(true, {transform: booleanAttribute});
  public readonly accept = input<string>('');
  public readonly maxSizeMB = input<number>(5);
  public readonly translationTexts = input<TranslationTexts>();

  public readonly filesChange = output<FileInputValue[]>();
  public readonly uploadRequest = output<FileInputValue[]>();

  private readonly fileUpload = viewChild.required(NdwuFileUploadComponent);

  public readonly effectiveSize = computed(() => this.fileUpload().effectiveSize());

  protected readonly initialFiles = computed(() => this.inputValue ?? []);

  constructor(
    protected readonly ngControl: NgControl,
  ) {
    super([]);
    setValueAccessor(this.ngControl, this);
  }

  public onFilesChange(files: FileInputValue[]): void {
    this.handleChange(files);
    this.filesChange.emit(files);
  }

  public onBlur(): void {
    this.onTouched();
  }

  public updateFileProgress(fileId: string, updates: Partial<FileInputValue>): void {
    this.fileUpload().updateFileProgress(fileId, updates);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {NDWU_SIZE, NdwuSizeDirective} from '@ndw-ui-kit/core';
import {
  type NdwuFileInputValue,
  type NdwuFileProgressUpdate,
  NdwuFileUploadComponent,
  type NdwuTranslationTexts,
} from '@ndw-ui-kit/core/widgets';
import {NdwuFormFieldBase} from '../../classes/form-field-base';
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
export class NdwuFileUploadFieldComponent extends NdwuFormFieldBase<NdwuFileInputValue[]> {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly multiple = input(true, {transform: booleanAttribute});
  public readonly accept = input<string>('');
  public readonly maxSizeMB = input<number>(5);
  public readonly translationTexts = input<NdwuTranslationTexts>();

  public readonly filesChange = output<NdwuFileInputValue[]>();
  public readonly uploadRequest = output<NdwuFileInputValue[]>();
  public readonly cancelRequest = output<NdwuFileInputValue[]>();

  private readonly fileUpload = viewChild(NdwuFileUploadComponent);

  public readonly effectiveSize = computed(() => this.fileUpload()?.effectiveSize() ?? NDWU_SIZE.XL);

  constructor(
    protected override readonly ngControl: NgControl,
  ) {
    super([]);
    setValueAccessor(this.ngControl, this);
  }

  public override writeValue(value: NdwuFileInputValue[] | null): void {
    super.writeValue(value ?? []);
    untracked(() => this.fileUpload()?.setFiles(this.inputValue));
  }

  public onFilesChange(files: NdwuFileInputValue[]): void {
    this.handleChange(files);
    this.filesChange.emit(files);
  }

  public onBlur(): void {
    this.onTouched();
  }

  public updateFileProgress(fileId: string, update: NdwuFileProgressUpdate): void {
    untracked(() => {
      const fileUpload = this.fileUpload();

      if (!fileUpload) {
        return;
      }

      const before = fileUpload.files();

      fileUpload.updateFileProgress(fileId, update);

      const after = fileUpload.files();

      if (after === before) {
        return;
      }

      this.inputValue = after;
      this.ngControl.control?.setValue(after, {emitModelToViewChange: false});
    });
  }
}

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
    // the widget keeps the visible list in its own signal, so `setValue`/`patchValue`/`reset`
    // must reach it here; `untracked` keeps a `setValue` from a consumer effect from tracking
    // the child query (see ADR 006)
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
    // reads and writes the widget's `files` signal: without `untracked`, a consumer effect
    // that forwards upload progress here would track `files` and re-run on its own write
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

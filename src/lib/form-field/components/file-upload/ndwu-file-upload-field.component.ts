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
import {NdwuSizeDirective} from '@ndw-ui-kit/core';
import {type NdwuFileInputValue, NdwuFileUploadComponent, type NdwuTranslationTexts} from '@ndw-ui-kit/core/widgets';
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
export class NdwuFileUploadFieldComponent extends FormFieldBase<NdwuFileInputValue[]> {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly multiple = input(true, {transform: booleanAttribute});
  public readonly accept = input<string>('');
  public readonly maxSizeMB = input<number>(5);
  public readonly translationTexts = input<NdwuTranslationTexts>();

  public readonly filesChange = output<NdwuFileInputValue[]>();
  public readonly uploadRequest = output<NdwuFileInputValue[]>();

  private readonly fileUpload = viewChild.required(NdwuFileUploadComponent);

  public readonly effectiveSize = computed(() => this.fileUpload().effectiveSize());

  protected readonly initialFiles = computed(() => this.inputValue ?? []);

  constructor(
    protected readonly ngControl: NgControl,
  ) {
    super([]);
    setValueAccessor(this.ngControl, this);
  }

  public onFilesChange(files: NdwuFileInputValue[]): void {
    this.handleChange(files);
    this.filesChange.emit(files);
  }

  public onBlur(): void {
    this.onTouched();
  }

  public updateFileProgress(fileId: string, updates: Partial<NdwuFileInputValue>): void {
    this.fileUpload().updateFileProgress(fileId, updates);
  }
}

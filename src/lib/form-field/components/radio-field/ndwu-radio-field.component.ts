import {Component, computed, inject, input} from '@angular/core';
import {NgControl} from '@angular/forms';
import {
  NDWU_OPTION_CONFIG,
  type NdwuOption,
  type NdwuOptionAdapter,
  NdwuRadioButtonComponent,
  NdwuRadioGroupComponent,
  NdwuSizeDirective,
  normalizeOptions,
  resolveOptionsAdapter,
} from '@ndw-ui-kit/core';
import {FormFieldBase} from '../../classes/form-field-base';
import {setValueAccessor} from '../../form-field.utils';

@Component({
  selector: 'ndwu-radio-field',
  templateUrl: './ndwu-radio-field.component.html',
  imports: [
    NdwuRadioGroupComponent,
    NdwuRadioButtonComponent,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuRadioFieldComponent<T = NdwuOption> extends FormFieldBase<string | number> {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly diOptionConfig = inject(NDWU_OPTION_CONFIG, {optional: true}) ?? null;

  public readonly options = input<readonly T[]>([]);
  public readonly optionAdapter = input<NdwuOptionAdapter<T> | undefined>(undefined);

  protected readonly normalizedOptions = computed<NdwuOption[]>(() => {
    return normalizeOptions(
      this.options(),
      resolveOptionsAdapter(this.optionAdapter(), this.diOptionConfig),
    );
  });

  constructor(
    protected ngControl: NgControl,
  ) {
    super('');
    setValueAccessor(this.ngControl, this);
  }

  public onBlur(): void {
    this.onTouched();
  }

  public onValueChange(value: string | number): void {
    this.handleChange(value);
  }
}

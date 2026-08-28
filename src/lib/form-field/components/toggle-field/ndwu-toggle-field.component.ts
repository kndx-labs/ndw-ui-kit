import {Component, inject, input} from '@angular/core';
import {NgControl} from '@angular/forms';
import {NdwuSizeDirective, NdwuToggleComponent, TOGGLE_COLOR, type ToggleColor} from '@ndw-ui-kit/core';
import {FormFieldBase} from '../../classes/form-field-base';
import {setValueAccessor} from '../../form-field.utils';

@Component({
  selector: 'ndwu-toggle-field',
  templateUrl: './ndwu-toggle-field.component.html',
  imports: [
    NdwuToggleComponent,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuToggleFieldComponent extends FormFieldBase<boolean> {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly label = input<string>('');
  public readonly secondaryText = input<string>('');
  public readonly color = input<ToggleColor>(TOGGLE_COLOR.BRAND);

  constructor(
    protected ngControl: NgControl,
  ) {
    super(false);
    setValueAccessor(this.ngControl, this);
  }

  public onBlur(): void {
    this.onTouched();
  }

  public onCheckedChange(checked: boolean): void {
    this.handleChange(checked);
  }
}

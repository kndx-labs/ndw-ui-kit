import {Component, DestroyRef, OnInit, inject, input, signal} from '@angular/core';
import {NgControl} from '@angular/forms';
import {NdwuCheckboxComponent, NdwuSizeDirective} from '@ndw-ui-kit/core';
import {FormFieldBase} from '../../classes/form-field-base';
import {setValueAccessor, syncIsInvalid} from '../../form-field.utils';

@Component({
  selector: 'ndwu-checkbox-field',
  templateUrl: './ndwu-checkbox-field.component.html',
  imports: [NdwuCheckboxComponent],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuCheckboxFieldComponent extends FormFieldBase<boolean> implements OnInit {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly label = input<string>('');
  public readonly secondaryText = input<string>('');
  public readonly inputId = input<string>('');

  protected readonly isInvalid = signal<boolean>(false);

  constructor(
    protected ngControl: NgControl,
    protected readonly destroyRef$: DestroyRef,
  ) {
    super(false);
    setValueAccessor(this.ngControl, this);
  }

  public ngOnInit(): void {
    const control = this.ngControl?.control;

    if (!control) {
      return;
    }

    syncIsInvalid(control, this.isInvalid, this.destroyRef$);
  }

  public onBlur(): void {
    this.onTouched();
  }

  public onCheckedChange(checked: boolean): void {
    this.handleChange(checked);
  }
}

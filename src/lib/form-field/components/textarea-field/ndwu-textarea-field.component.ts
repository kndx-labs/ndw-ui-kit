import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  booleanAttribute,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  type NdwuHelperMessageStatus,
  NdwuHintDirective,
  NdwuSizeDirective,
  NdwuTextareaComponent,
  type NdwuTextareaResizeDirection,
} from '@ndw-ui-kit/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuFormFieldBase} from '../../classes/form-field-base';
import {NdwuHelperMessageComponent} from '../../parts/helper-message/ndwu-helper-message.component';

@Component({
  selector: 'ndwu-textarea-field',
  templateUrl: './ndwu-textarea-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuFloatingLabelComponent,
    NdwuFormFieldComponent,
    NdwuHelperMessageComponent,
    NdwuHintDirective,
    NdwuTextareaComponent,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuTextareaFieldComponent extends NdwuFormFieldBase<string> implements OnInit {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly label = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly hint = input<string>('');
  public readonly ariaLabel = input<string>('');
  public readonly ndwuRequired = input(false, {transform: booleanAttribute});
  public readonly readonly = input(false, {transform: booleanAttribute});
  public readonly loading = input(false, {transform: booleanAttribute});
  public readonly loadingLabel = input<string>('');
  public readonly resizable = input(true, {transform: booleanAttribute});
  public readonly resizeDirection = input<NdwuTextareaResizeDirection>('both');
  public readonly showLineNumbers = input(false, {transform: booleanAttribute});

  protected readonly hintId = `${uniqueId('ndwu-textarea-field-')}-hint`;

  protected readonly hasHelperMessage = computed(() => {
    return !!this.errorMessage() || !!this.hint();
  });

  protected readonly hintStatus = computed((): NdwuHelperMessageStatus => {
    return this.errorMessage() ? 'error' : 'default';
  });

  protected readonly textarea = viewChild(NdwuTextareaComponent);

  constructor() {
    super('');
  }

  public ngOnInit(): void {
    this.initValidationState();
  }

  public override writeValue(value: string | null): void {
    const normalized = value ?? '';

    super.writeValue(normalized);
    this.textarea()?.setValue(normalized);
  }

  public onBlur(): void {
    this.onTouched();
  }

  public onValueChange(value: string): void {
    this.handleChange(value);
  }

  public setFocus(): void {
    this.textarea()?.focus();
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {merge} from 'rxjs';
import {
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  type NdwuHelperMessageStatus,
  NdwuHintDirective,
  NdwuSizeDirective,
  NdwuTextareaComponent,
} from '@ndw-ui-kit/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NDWU_VALIDATION_PROCESSOR, type NdwuValidationData} from '../../validation';
import {FormFieldBase} from '../../classes/form-field-base';
import {NdwuHelperMessageComponent} from '../helper-message/ndwu-helper-message.component';
import {setValueAccessor} from '../../form-field.utils';

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
export class NdwuTextareaFieldComponent extends FormFieldBase<string> implements OnInit {
  protected readonly ngControl = inject(NgControl);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly validationExtractor = inject(NDWU_VALIDATION_PROCESSOR);

  public readonly label = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly hint = input<string>('');
  public readonly ariaLabel = input<string>('');
  public readonly ndwuRequired = input(false, {transform: booleanAttribute});
  public readonly readonly = input(false, {transform: booleanAttribute});
  public readonly resizable = input(true, {transform: booleanAttribute});
  public readonly showLineNumbers = input(false, {transform: booleanAttribute});

  protected readonly hintId = `${uniqueId('ndwu-textarea-field-')}-hint`;

  protected readonly isInvalid = signal<boolean>(false);
  protected readonly extractedValidation = signal<NdwuValidationData | null>(null);

  protected readonly errorMessage = computed(() => {
    return this.isInvalid()
      ? this.extractedValidation()?.errorMessage ?? ''
      : '';
  });

  protected readonly validationData = computed(() => {
    return this.extractedValidation()?.validationData ?? {};
  });

  protected readonly hasHelperMessage = computed(() => {
    return !!this.errorMessage() || !!this.hint();
  });

  protected readonly hintStatus = computed((): NdwuHelperMessageStatus => {
    return this.errorMessage() ? 'error' : 'default';
  });

  protected readonly textarea = viewChild(NdwuTextareaComponent);

  constructor() {
    super('');
    setValueAccessor(this.ngControl, this);
  }

  public ngOnInit(): void {
    const control = this.ngControl?.control;

    if (!control) {
      return;
    }

    const updateValidationState = (): void => {
      this.isInvalid.set(control.invalid && (control.touched || control.dirty));
      this.extractedValidation.set(this.validationExtractor(control));
    };

    updateValidationState();

    merge(control.statusChanges, control.valueChanges, control.events)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(updateValidationState);
  }

  public override writeValue(value: string | null): void {
    const normalized = value ?? '';

    super.writeValue(normalized);
    this.textarea()?.setValue(normalized);
    this.cdr.markForCheck();
  }

  public override setDisabledState(isDisabled: boolean): void {
    super.setDisabledState(isDisabled);
    this.cdr.markForCheck();
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

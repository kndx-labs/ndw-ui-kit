import {
  Component,
  DestroyRef,
  OnInit,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {merge} from 'rxjs';
import {
  NDWU_ICON_NAME,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  type NdwuHelperMessageStatus,
  NdwuHintDirective,
  NdwuIconButtonComponent,
  NdwuInputDirective,
  type NdwuPasswordStrength,
  type NdwuPasswordStrengthHintTexts,
  NdwuPasswordStrengthIndicatorComponent,
  NdwuSizeDirective,
  NdwuSuffixDirective,
} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NDWU_VALIDATION_PROCESSOR, NdwuValidationData} from '../../validation';
import {FormFieldBase} from '../../classes/form-field-base';
import {NdwuHelperMessageComponent} from '../helper-message/ndwu-helper-message.component';
import {setValueAccessor} from '../../form-field.utils';

@Component({
  selector: 'ndwu-password-input-field',
  standalone: true,
  templateUrl: './ndwu-password-input-field.component.html',
  styleUrl: './ndwu-password-input-field.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    LocalizePipe,
    NdwuFloatingLabelComponent,
    NdwuFormFieldComponent,
    NdwuHelperMessageComponent,
    NdwuHintDirective,
    NdwuIconButtonComponent,
    NdwuInputDirective,
    NdwuPasswordStrengthIndicatorComponent,
    NdwuSuffixDirective,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  host: {
    '[class.ndwu-password-input-field--error]': 'inputStatus() === "error"',
  },
})
export class NdwuPasswordInputFieldComponent extends FormFieldBase<string> implements OnInit {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly validationExtractor = inject(NDWU_VALIDATION_PROCESSOR);
  protected readonly destroyRef = inject(DestroyRef);

  public readonly label = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly hint = input<string>('');
  public readonly required = input(false, {transform: booleanAttribute});

  public readonly strength = input<NdwuPasswordStrength | null>(null);
  public readonly strengthHintTexts = input<NdwuPasswordStrengthHintTexts>({});

  public readonly showPasswordIconLabel = input<string>('');
  public readonly hidePasswordIconLabel = input<string>('');

  protected readonly invalid = signal<boolean>(false);
  protected readonly isPasswordVisible = signal<boolean>(false);
  protected readonly extractedValidation = signal<NdwuValidationData | null>(null);

  protected readonly errorMessage = computed(() => {
    return this.invalid() ? this.extractedValidation()?.errorMessage ?? '' : '';
  });

  protected readonly validationData = computed(() => {
    return this.extractedValidation()?.validationData ?? {};
  });

  protected readonly inputStatus = computed(() => {
    if (this.invalid() || this.strength() === 'weak') {
      return 'error';
    }

    return 'default';
  });

  protected readonly inputClass = computed(() => {
    if (this.inputStatus() === 'error') {
      return 'ndwu-form-field__input--error';
    }

    return '';
  });

  protected readonly hintStatus = computed((): NdwuHelperMessageStatus => {
    if (this.invalid() || this.strength() === 'weak') {
      return 'error';
    }

    return 'default';
  });

  protected readonly internalHint = computed(() => {
    const strength = this.strength();
    const isInvalid = this.invalid();
    const hintTexts = this.strengthHintTexts();

    if (isInvalid) {
      return '';
    }

    if (!strength) {
      return hintTexts.default ?? '';
    }

    if (strength === 'weak') {
      return hintTexts.weak ?? '';
    }

    if (strength === 'average') {
      return hintTexts.average ?? '';
    }

    if (strength === 'strong') {
      return hintTexts.strong ?? '';
    }

    return '';
  });

  protected readonly inputType = computed(() => {
    return this.isPasswordVisible() ? 'text' : 'password';
  });

  protected readonly eyeIcon = computed(() => {
    return this.isPasswordVisible() ? NDWU_ICON_NAME.EYE_OFF_S : NDWU_ICON_NAME.EYE_ON_S;
  });

  protected readonly eyeIconLabel = computed(() => {
    return this.isPasswordVisible() ? this.hidePasswordIconLabel() : this.showPasswordIconLabel();
  });

  constructor(
    protected ngControl: NgControl,
  ) {
    super('');
    setValueAccessor(this.ngControl, this);
  }

  public ngOnInit(): void {
    const control = this.ngControl?.control;

    if (!control) {
      return;
    }

    const updateValidationState = () => {
      const controlInvalid = control.invalid ?? false;
      const controlInteracted = (control.touched ?? false) || (control.dirty ?? false);

      this.invalid.set(controlInvalid && controlInteracted);
      this.extractedValidation.set(this.validationExtractor(control));
    };

    updateValidationState();

    merge(control.statusChanges, control.valueChanges)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        updateValidationState();
      });
  }

  public onBlur(): void {
    this.onTouched();
  }

  public onInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    this.handleChange(target.value);
  }

  public setPasswordVisibility(value: boolean): void {
    this.isPasswordVisible.set(value);
  }

  public togglePasswordVisibility(): void {
    this.isPasswordVisible.update((value) => !value);
  }
}

import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {merge} from 'rxjs';
import {NDWU_VALIDATION_PROCESSOR, NdwuValidationData} from '../../validation';
import {
  NDWU_ICON_NAME,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  NdwuHintDirective,
  NdwuIconComponent,
  type NdwuIconName,
  NdwuInputDirective,
  NdwuRightIconDirective,
  NdwuSizeDirective,
} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {FormFieldBase} from '../../classes/form-field-base';
import {NdwuHelperMessageComponent} from '../helper-message/ndwu-helper-message.component';
import {setValueAccessor} from '../../form-field.utils';

@Component({
  selector: 'ndwu-input-field',
  templateUrl: './ndwu-input-field.component.html',
  imports: [
    LocalizePipe,
    NdwuFormFieldComponent,
    NdwuHelperMessageComponent,
    NdwuHintDirective,
    NdwuIconComponent,
    NdwuInputDirective,
    NdwuFloatingLabelComponent,
    NdwuRightIconDirective,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuInputFieldComponent extends FormFieldBase<string> implements OnInit {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly validationExtractor = inject(NDWU_VALIDATION_PROCESSOR);

  public readonly label = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly hint = input<string>('');
  public readonly ndwuRequired = input(false, {transform: booleanAttribute});
  public readonly type = input<'text' | 'password'>('text');
  public readonly readonly = input(false, {transform: booleanAttribute});

  public readonly rightIcon = input<NdwuIconName | undefined>(undefined);
  public readonly rightIconClicked = output<MouseEvent>();

  public readonly showPasswordIconLabel = input<string>('');
  public readonly hidePasswordIconLabel = input<string>('');

  protected readonly invalid = signal<boolean>(false);
  protected readonly isPasswordVisible = signal<boolean>(false);
  protected readonly isPasswordInput = computed(() => {
    return this.type() === 'password';
  });

  protected readonly inputType = computed(() => {
    if (this.type() === 'password') {
      return this.isPasswordVisible() ? 'text' : 'password';
    }

    return this.type();
  });

  protected readonly eyeIcon = computed(() => {
    return this.isPasswordVisible() ? NDWU_ICON_NAME.EYE_OFF_S : NDWU_ICON_NAME.EYE_ON_S;
  });

  protected readonly eyeIconLabel = computed(() => {
    return this.isPasswordVisible() ? this.hidePasswordIconLabel() : this.showPasswordIconLabel();
  });

  protected readonly showRightIcon = computed(() => {
    return !!this.rightIcon() && !this.isPasswordInput();
  });

  protected readonly hasRightIcon = computed(() => {
    return this.isPasswordInput() || this.showRightIcon();
  });

  protected readonly extractedValidation = signal<NdwuValidationData | null>(null);

  protected readonly errorMessage = computed(() => {
    return this.invalid()
      ? this.extractedValidation()?.errorMessage ?? ''
      : '';
  });

  protected readonly validationData = computed(() => {
    return this.extractedValidation()?.validationData ?? {};
  });

  protected readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  constructor(
    protected ngControl: NgControl,
    protected readonly destroyRef$: DestroyRef,
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

    // Initialize state once (no initial emission from observables)
    updateValidationState();

    merge(control.statusChanges, control.valueChanges)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
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

  public togglePasswordVisibility(): void {
    this.isPasswordVisible.update((value) => !value);
  }

  public onRightIconClick(event: MouseEvent): void {
    this.rightIconClicked.emit(event);
  }

  public setFocus(): void {
    this.input()?.nativeElement?.focus();
  }
}

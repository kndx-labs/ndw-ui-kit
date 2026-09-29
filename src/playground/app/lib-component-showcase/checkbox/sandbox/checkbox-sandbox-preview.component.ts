import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {NDWU_SIZE, type NdwuSize} from '@ndw-ui-kit/core';
import {NdwuCheckboxFieldComponent} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

interface TokenPickerValues extends Record<string, string> {
  borderColor: string;
  bg: string;
  labelColor: string;
  secondaryTextColor: string;
  checkmarkColor: string;
  hoverBorderColor: string;
  hoverBg: string;
  activeBorderColor: string;
  activeBg: string;
  focusBorderColor: string;
  focusBg: string;
  focusColor: string;
  checkedBorderColor: string;
  checkedBg: string;
  disabledBg: string;
  disabledBorderColor: string;
  disabledCheckmarkColor: string;
  labelDisabledColor: string;
  secondaryTextDisabledColor: string;
  invalidBorderColor: string;
  invalidHoverBorderColor: string;
  invalidOutlineColor: string;
}

@Component({
  selector: 'app-checkbox-sandbox-preview',
  templateUrl: './checkbox-sandbox-preview.component.html',
  styleUrl: './checkbox-sandbox-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuCheckboxFieldComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class CheckboxSandboxPreviewComponent extends SandboxBaseComponent {
  public readonly SIZE = NDWU_SIZE;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly sandboxForm = new FormGroup({
    size: new FormControl<NdwuSize>(NDWU_SIZE.XL, {nonNullable: true}),
    isDisabled: new FormControl<boolean>(false, {nonNullable: true}),
    label: new FormControl<string>('Accept terms and conditions', {nonNullable: true}),
    secondaryText: new FormControl<string>('By checking this box, you agree to our terms of service', {
      nonNullable: true,
    }),
    valueCheckbox: new FormControl<boolean>(false, {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup({
    borderColor: new FormControl<string>('', {nonNullable: true}),
    bg: new FormControl<string>('', {nonNullable: true}),
    labelColor: new FormControl<string>('', {nonNullable: true}),
    secondaryTextColor: new FormControl<string>('', {nonNullable: true}),
    checkmarkColor: new FormControl<string>('', {nonNullable: true}),
    hoverBorderColor: new FormControl<string>('', {nonNullable: true}),
    hoverBg: new FormControl<string>('', {nonNullable: true}),
    activeBorderColor: new FormControl<string>('', {nonNullable: true}),
    activeBg: new FormControl<string>('', {nonNullable: true}),
    focusBorderColor: new FormControl<string>('', {nonNullable: true}),
    focusBg: new FormControl<string>('', {nonNullable: true}),
    focusColor: new FormControl<string>('', {nonNullable: true}),
    checkedBorderColor: new FormControl<string>('', {nonNullable: true}),
    checkedBg: new FormControl<string>('', {nonNullable: true}),
    disabledBg: new FormControl<string>('', {nonNullable: true}),
    disabledBorderColor: new FormControl<string>('', {nonNullable: true}),
    disabledCheckmarkColor: new FormControl<string>('', {nonNullable: true}),
    labelDisabledColor: new FormControl<string>('', {nonNullable: true}),
    secondaryTextDisabledColor: new FormControl<string>('', {nonNullable: true}),
    invalidBorderColor: new FormControl<string>('', {nonNullable: true}),
    invalidHoverBorderColor: new FormControl<string>('', {nonNullable: true}),
    invalidOutlineColor: new FormControl<string>('', {nonNullable: true}),
  });

  public readonly tokenList: readonly TokenListItem[] = [
    {cssVar: '--ndwu-checkbox-border-color', key: 'borderColor'},
    {cssVar: '--ndwu-checkbox-bg', key: 'bg'},
    {cssVar: '--ndwu-checkbox-label-color', key: 'labelColor'},
    {cssVar: '--ndwu-checkbox-secondary-text-color', key: 'secondaryTextColor'},
    {cssVar: '--ndwu-checkbox-checkmark-color', key: 'checkmarkColor'},
    {cssVar: '--ndwu-checkbox-hover-border-color', key: 'hoverBorderColor'},
    {cssVar: '--ndwu-checkbox-hover-bg', key: 'hoverBg'},
    {cssVar: '--ndwu-checkbox-active-border-color', key: 'activeBorderColor'},
    {cssVar: '--ndwu-checkbox-active-bg', key: 'activeBg'},
    {cssVar: '--ndwu-checkbox-focus-border-color', key: 'focusBorderColor'},
    {cssVar: '--ndwu-checkbox-focus-bg', key: 'focusBg'},
    {cssVar: '--ndwu-checkbox-focus-color', key: 'focusColor'},
    {cssVar: '--ndwu-checkbox-checked-border-color', key: 'checkedBorderColor'},
    {cssVar: '--ndwu-checkbox-checked-bg', key: 'checkedBg'},
    {cssVar: '--ndwu-checkbox-disabled-bg', key: 'disabledBg'},
    {cssVar: '--ndwu-checkbox-disabled-border-color', key: 'disabledBorderColor'},
    {cssVar: '--ndwu-checkbox-disabled-checkmark-color', key: 'disabledCheckmarkColor'},
    {cssVar: '--ndwu-checkbox-label-disabled-color', key: 'labelDisabledColor'},
    {cssVar: '--ndwu-checkbox-secondary-text-disabled-color', key: 'secondaryTextDisabledColor'},
    {cssVar: '--ndwu-checkbox-invalid-border-color', key: 'invalidBorderColor'},
    {cssVar: '--ndwu-checkbox-invalid-hover-border-color', key: 'invalidHoverBorderColor'},
    {cssVar: '--ndwu-checkbox-invalid-outline-color', key: 'invalidOutlineColor'},
  ];

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<TokenPickerValues>({
    borderColor: '#000000',
    bg: '#000000',
    labelColor: '#000000',
    secondaryTextColor: '#000000',
    checkmarkColor: '#000000',
    hoverBorderColor: '#000000',
    hoverBg: '#000000',
    activeBorderColor: '#000000',
    activeBg: '#000000',
    focusBorderColor: '#000000',
    focusBg: '#000000',
    focusColor: '#000000',
    checkedBorderColor: '#000000',
    checkedBg: '#000000',
    disabledBg: '#000000',
    disabledBorderColor: '#000000',
    disabledCheckmarkColor: '#000000',
    labelDisabledColor: '#000000',
    secondaryTextDisabledColor: '#000000',
    invalidBorderColor: '#000000',
    invalidHoverBorderColor: '#000000',
    invalidOutlineColor: '#000000',
  });

  protected override readonly tokenMapping: TokenMapping[] = [
    {key: 'borderColor', cssVar: '--ndwu-checkbox-border-color'},
    {key: 'bg', cssVar: '--ndwu-checkbox-bg'},
    {key: 'labelColor', cssVar: '--ndwu-checkbox-label-color'},
    {key: 'secondaryTextColor', cssVar: '--ndwu-checkbox-secondary-text-color'},
    {key: 'checkmarkColor', cssVar: '--ndwu-checkbox-checkmark-color'},
    {key: 'hoverBorderColor', cssVar: '--ndwu-checkbox-hover-border-color'},
    {key: 'hoverBg', cssVar: '--ndwu-checkbox-hover-bg'},
    {key: 'activeBorderColor', cssVar: '--ndwu-checkbox-active-border-color'},
    {key: 'activeBg', cssVar: '--ndwu-checkbox-active-bg'},
    {key: 'focusBorderColor', cssVar: '--ndwu-checkbox-focus-border-color'},
    {key: 'focusBg', cssVar: '--ndwu-checkbox-focus-bg'},
    {key: 'focusColor', cssVar: '--ndwu-checkbox-focus-color'},
    {key: 'checkedBorderColor', cssVar: '--ndwu-checkbox-checked-border-color'},
    {key: 'checkedBg', cssVar: '--ndwu-checkbox-checked-bg'},
    {key: 'disabledBg', cssVar: '--ndwu-checkbox-disabled-bg'},
    {key: 'disabledBorderColor', cssVar: '--ndwu-checkbox-disabled-border-color'},
    {key: 'disabledCheckmarkColor', cssVar: '--ndwu-checkbox-disabled-checkmark-color'},
    {key: 'labelDisabledColor', cssVar: '--ndwu-checkbox-label-disabled-color'},
    {key: 'secondaryTextDisabledColor', cssVar: '--ndwu-checkbox-secondary-text-disabled-color'},
    {key: 'invalidBorderColor', cssVar: '--ndwu-checkbox-invalid-border-color'},
    {key: 'invalidHoverBorderColor', cssVar: '--ndwu-checkbox-invalid-hover-border-color'},
    {key: 'invalidOutlineColor', cssVar: '--ndwu-checkbox-invalid-outline-color'},
  ];

  public override resetSandbox(): void {
    this.applySandboxDisabled();
    super.resetSandbox();
  }

  private applySandboxDisabled(): void {
    const disabled = this.sandboxForm.controls.isDisabled.value;
    const valueCheckboxCtrl = this.sandboxForm.controls.valueCheckbox;

    if (disabled) {
      if (valueCheckboxCtrl.enabled) {
        valueCheckboxCtrl.disable({emitEvent: false});
      }

      return;
    }

    if (valueCheckboxCtrl.disabled) {
      valueCheckboxCtrl.enable({emitEvent: false});
    }
  }

  protected override onInit(): void {
    this.applySandboxDisabled();
    this.sandboxForm.controls.isDisabled.valueChanges.subscribe(() => this.applySandboxDisabled());
  }

  protected getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement;
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      size: NDWU_SIZE.XL,
      isDisabled: false,
      label: 'Accept terms and conditions',
      secondaryText: 'By checking this box, you agree to our terms of service',
      valueCheckbox: false,
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return {
      borderColor: '',
      bg: '',
      labelColor: '',
      secondaryTextColor: '',
      checkmarkColor: '',
      hoverBorderColor: '',
      hoverBg: '',
      activeBorderColor: '',
      activeBg: '',
      focusBorderColor: '',
      focusBg: '',
      focusColor: '',
      checkedBorderColor: '',
      checkedBg: '',
      disabledBg: '',
      disabledBorderColor: '',
      disabledCheckmarkColor: '',
      labelDisabledColor: '',
      secondaryTextDisabledColor: '',
      invalidBorderColor: '',
      invalidHoverBorderColor: '',
      invalidOutlineColor: '',
    };
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

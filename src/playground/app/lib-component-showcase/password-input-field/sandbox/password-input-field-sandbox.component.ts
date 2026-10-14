import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NDWU_ICON_NAME, NDWU_SIZE, type NdwuPasswordStrength, type NdwuSize} from '@ndw-ui-kit/core';
import {NdwuPasswordInputFieldComponent} from '@ndw-ui-kit/core/form-field';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {CssUtils} from '@app/utils';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

const PSI_TOKENS = [
  'psi-default',
  'psi-weak-active',
  'psi-weak-inactive',
  'psi-average-active',
  'psi-average-inactive',
  'psi-strong-active',
] as const;

const PSI_CSS_VAR: Record<string, string> = {
  'psi-default': '--ndwu-password-strength-indicator-default',
  'psi-weak-active': '--ndwu-password-strength-indicator-weak-active',
  'psi-weak-inactive': '--ndwu-password-strength-indicator-weak-inactive',
  'psi-average-active': '--ndwu-password-strength-indicator-average-active',
  'psi-average-inactive': '--ndwu-password-strength-indicator-average-inactive',
  'psi-strong-active': '--ndwu-password-strength-indicator-strong-active',
};

const PSI_READ_CSS_VAR: Record<string, string> = {
  'psi-default': '--ndwu-password-strength-indicator-default',
  'psi-weak-active': '--ndwu-password-strength-indicator-weak-active',
  'psi-weak-inactive': '--ndwu-password-strength-indicator-weak-inactive',
  'psi-average-active': '--ndwu-password-strength-indicator-average-active',
  'psi-average-inactive': '--ndwu-password-strength-indicator-average-inactive',
  'psi-strong-active': '--ndwu-password-strength-indicator-strong-active',
};

const DEFAULT_FORM_VALUES = {
  value: 'MyStr0ngP@ss2024',
  label: 'Password',
  placeholder: 'Enter password',
  hint: 'Use at least 8 characters',
  size: NDWU_SIZE.XL,
  strength: 'strong',
  isRequired: false,
  isDisabled: false,
};

const DEFAULT_TOKEN_VALUES = Object.fromEntries(PSI_TOKENS.map((key) => [key, '']));

type SandboxStrength = 'none' | 'weak' | 'average' | 'strong';

@Component({
  selector: 'app-password-input-field-sandbox',
  templateUrl: './password-input-field-sandbox.component.html',
  styleUrl: './password-input-field-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuPasswordInputFieldComponent,
    NdwuLocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class PasswordInputFieldSandboxComponent extends SandboxBaseComponent {
  public readonly SIZE = NDWU_SIZE;
  public readonly ICON_NAME = NDWU_ICON_NAME;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly SIZE_OPTIONS = [
    {id: NDWU_SIZE.S, label: 'S'},
    {id: NDWU_SIZE.L, label: 'L'},
    {id: NDWU_SIZE.XL, label: 'XL'},
    {id: NDWU_SIZE.XXL, label: 'XXL'},
  ];

  public readonly strengthOptions: {id: SandboxStrength; label: string}[] = [
    {id: 'none', label: 'None'},
    {id: 'weak', label: 'Weak'},
    {id: 'average', label: 'Average'},
    {id: 'strong', label: 'Strong'},
  ];

  public readonly tokenList: readonly TokenListItem[] = PSI_TOKENS.map((key) => ({
    cssVar: CssUtils.tokenKeyToCssVar(key),
    key,
  }));

  public readonly sandboxForm = new FormGroup({
    value: new FormControl<string>('MyStr0ngP@ss2024', {nonNullable: true}),
    label: new FormControl<string>('Password', {nonNullable: true}),
    placeholder: new FormControl<string>('Enter password', {nonNullable: true}),
    hint: new FormControl<string>('Use at least 8 characters', {nonNullable: true}),
    size: new FormControl<NdwuSize>(NDWU_SIZE.XL, {nonNullable: true}),
    strength: new FormControl<SandboxStrength>('strong', {nonNullable: true}),
    isRequired: new FormControl<boolean>(false, {nonNullable: true}),
    isDisabled: new FormControl<boolean>(false, {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      PSI_TOKENS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ) as Record<(typeof PSI_TOKENS)[number], FormControl<string>>,
  );

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  protected override readonly tokenMapping: TokenMapping[] = PSI_TOKENS.map((key) => ({
    key,
    cssVar: PSI_CSS_VAR[key] ?? '',
    readCssVar: PSI_READ_CSS_VAR[key],
  }));

  public getStrength(): NdwuPasswordStrength | null {
    const strength = this.sandboxForm.controls.strength.value;

    if (strength === 'none') {
      return null;
    }

    return strength;
  }

  public getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement?.querySelector('ndwu-password-input-field') as HTMLElement | undefined;
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return DEFAULT_FORM_VALUES;
  }

  protected override getTokenResetValues(): Record<string, string> {
    return DEFAULT_TOKEN_VALUES;
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }

  public override resetSandbox(): void {
    this.applySandboxDisabled();
    super.resetSandbox();
  }

  protected override onInit(): void {
    this.applySandboxDisabled();

    this.sandboxForm.controls.isDisabled.valueChanges.subscribe(() => {
      this.applySandboxDisabled();
    });
  }

  private applySandboxDisabled(): void {
    const disabled = this.sandboxForm.controls.isDisabled.value;
    const valueCtrl = this.sandboxForm.controls.value;

    if (disabled && valueCtrl.enabled) {
      valueCtrl.disable({emitEvent: false});

      return;
    }

    if (!disabled && valueCtrl.disabled) {
      valueCtrl.enable({emitEvent: false});
    }
  }
}

import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ICON_NAME, type NdwuIconName, type NdwuSize, SIZE} from '@ndw-ui-kit/core';
import {NdwuInputFieldComponent} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {STRETCH_WIDTH_VALUE, SandboxToolbarComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {SIZE_OPTIONS} from '../input-showcase.constants';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

type SandboxType = 'text' | 'password';
type SandboxRightIcon = 'none' | 'search' | 'close';

interface TokenPickerValues extends Record<string, string> {
  borderColor: string;
  bg: string;
  text: string;
  labelColor: string;
  placeholderColor: string;
  focusBorderColor: string;
  outlineBorderColor: string;
  invalidBorderColor: string;
  disabledBg: string;
}

@Component({
  selector: 'app-input-sandbox-preview',
  templateUrl: './input-sandbox-preview.component.html',
  styleUrl: './input-sandbox-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuInputFieldComponent,
    LocalizePipe,
    SandboxToolbarComponent,
    TokenListComponent,
  ],
})
export class InputSandboxPreviewComponent extends SandboxBaseComponent {
  public readonly SIZE = SIZE;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');
  private readonly sandboxToolbar = viewChild(SandboxToolbarComponent);
  public readonly previewWidth = signal<string>(STRETCH_WIDTH_VALUE);

  public readonly sandboxForm = new FormGroup({
    value: new FormControl<string>('Sample text', {nonNullable: true}),
    label: new FormControl<string>('Email Address', {nonNullable: true}),
    placeholder: new FormControl<string>('Enter text', {nonNullable: true}),
    hint: new FormControl<string>('We\'ll never share your email with anyone else', {nonNullable: true}),
    size: new FormControl<NdwuSize>(SIZE.XL, {nonNullable: true}),
    isRequired: new FormControl<boolean>(false, {nonNullable: true}),
    isDisabled: new FormControl<boolean>(false, {nonNullable: true}),
    isReadonly: new FormControl<boolean>(false, {nonNullable: true}),
    type: new FormControl<SandboxType>('text', {nonNullable: true}),
    rightIcon: new FormControl<SandboxRightIcon>('none', {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup({
    borderColor: new FormControl<string>('', {nonNullable: true}),
    bg: new FormControl<string>('', {nonNullable: true}),
    text: new FormControl<string>('', {nonNullable: true}),
    labelColor: new FormControl<string>('', {nonNullable: true}),
    placeholderColor: new FormControl<string>('', {nonNullable: true}),
    focusBorderColor: new FormControl<string>('', {nonNullable: true}),
    outlineBorderColor: new FormControl<string>('', {nonNullable: true}),
    invalidBorderColor: new FormControl<string>('', {nonNullable: true}),
    disabledBg: new FormControl<string>('', {nonNullable: true}),
  });

  public readonly tokenList: readonly TokenListItem[] = [
    {cssVar: '--ndwu-form-field-border-color', key: 'borderColor'},
    {cssVar: '--ndwu-form-field-bg', key: 'bg'},
    {cssVar: '--ndwu-form-field-text', key: 'text'},
    {cssVar: '--ndwu-form-field-label-color', key: 'labelColor'},
    {cssVar: '--ndwu-form-field-placeholder-color', key: 'placeholderColor'},
    {cssVar: '--ndwu-form-field-focus-border-color', key: 'focusBorderColor'},
    {cssVar: '--ndwu-form-field-outline-border-color', key: 'outlineBorderColor'},
    {cssVar: '--ndwu-form-field-invalid-border-color', key: 'invalidBorderColor'},
    {cssVar: '--ndwu-form-field-disabled-bg', key: 'disabledBg'},
  ];

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<TokenPickerValues>({
    borderColor: '#000000',
    bg: '#000000',
    text: '#000000',
    labelColor: '#000000',
    placeholderColor: '#000000',
    focusBorderColor: '#000000',
    outlineBorderColor: '#000000',
    invalidBorderColor: '#000000',
    disabledBg: '#000000',
  });

  protected override readonly tokenMapping: TokenMapping[] = [
    {key: 'borderColor', cssVar: '--ndwu-form-field-border-color'},
    {key: 'bg', cssVar: '--ndwu-form-field-bg'},
    {key: 'text', cssVar: '--ndwu-form-field-text'},
    {key: 'labelColor', cssVar: '--ndwu-form-field-label-color'},
    {key: 'placeholderColor', cssVar: '--ndwu-form-field-placeholder-color'},
    {key: 'focusBorderColor', cssVar: '--ndwu-form-field-focus-border-color'},
    {key: 'outlineBorderColor', cssVar: '--ndwu-form-field-outline-border-color'},
    {key: 'invalidBorderColor', cssVar: '--ndwu-form-field-invalid-border-color'},
    {key: 'disabledBg', cssVar: '--ndwu-form-field-disabled-bg'},
  ];

  protected readonly SIZE_OPTIONS = SIZE_OPTIONS;

  public override resetSandbox(): void {
    this.applySandboxDisabled();
    super.resetSandbox();
  }

  public onWidthChange(width: string): void {
    this.previewWidth.set(width);
  }

  public getRightIconName(): NdwuIconName | undefined {
    const type = this.sandboxForm.controls.type.value;
    const rightIcon = this.sandboxForm.controls.rightIcon.value;

    if (type === 'password') {
      return undefined;
    }

    if (rightIcon === 'search') {
      return ICON_NAME.SEARCH_L;
    }

    if (rightIcon === 'close') {
      return this.sandboxTheme() === 'dark' ? ICON_NAME.CLOSE_L : ICON_NAME.CLOSE_S;
    }

    return undefined;
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

  protected override onInit(): void {
    this.applySandboxDisabled();

    this.sandboxForm.controls.isDisabled.valueChanges.subscribe(() => this.applySandboxDisabled());
  }

  protected override onAfterViewInit(): void {
    this.previewWidth.set(this.sandboxToolbar()?.width() ?? STRETCH_WIDTH_VALUE);
  }

  protected getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement;
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      value: 'Sample text',
      label: 'Email Address',
      placeholder: 'Enter text',
      hint: 'We\'ll never share your email with anyone else',
      size: SIZE.XL,
      isRequired: false,
      isDisabled: false,
      isReadonly: false,
      type: 'text',
      rightIcon: 'none',
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return {
      borderColor: '',
      bg: '',
      text: '',
      labelColor: '',
      placeholderColor: '',
      focusBorderColor: '',
      outlineBorderColor: '',
      invalidBorderColor: '',
      disabledBg: '',
    };
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

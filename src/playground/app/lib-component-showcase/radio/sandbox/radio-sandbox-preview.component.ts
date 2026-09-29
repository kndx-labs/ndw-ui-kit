import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {NDWU_SIZE, type NdwuOption, type NdwuSize} from '@ndw-ui-kit/core';
import {NdwuRadioFieldComponent} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

interface TokenPickerValues extends Record<string, string> {
  borderColor: string;
  bg: string;
  labelColor: string;
  secondaryTextColor: string;
  checkedDotColor: string;
  checkedBorderColor: string;
  checkedBg: string;
  focusBorderColor: string;
  focusBg: string;
  focusColor: string;
  disabledBg: string;
}

@Component({
  selector: 'app-radio-sandbox-preview',
  templateUrl: './radio-sandbox-preview.component.html',
  styleUrl: './radio-sandbox-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuRadioFieldComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class RadioSandboxPreviewComponent extends SandboxBaseComponent {
  public readonly SIZE = NDWU_SIZE;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly options: NdwuOption[] = [
    {value: 'option1', label: 'radio-showcase.option-1'},
    {value: 'option2', label: 'radio-showcase.option-2'},
    {
      value: 'option3',
      label: 'radio-showcase.option-3',
      secondaryText: 'common.additional-text',
    },
  ];

  public readonly sandboxForm = new FormGroup({
    option: new FormControl<string>('option1', {nonNullable: true}),
    size: new FormControl<NdwuSize>(NDWU_SIZE.XL, {nonNullable: true}),
    isDisabled: new FormControl<boolean>(false, {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup({
    borderColor: new FormControl<string>('', {nonNullable: true}),
    bg: new FormControl<string>('', {nonNullable: true}),
    labelColor: new FormControl<string>('', {nonNullable: true}),
    secondaryTextColor: new FormControl<string>('', {nonNullable: true}),
    checkedDotColor: new FormControl<string>('', {nonNullable: true}),
    checkedBorderColor: new FormControl<string>('', {nonNullable: true}),
    checkedBg: new FormControl<string>('', {nonNullable: true}),
    focusBorderColor: new FormControl<string>('', {nonNullable: true}),
    focusBg: new FormControl<string>('', {nonNullable: true}),
    focusColor: new FormControl<string>('', {nonNullable: true}),
    disabledBg: new FormControl<string>('', {nonNullable: true}),
  });

  public readonly tokenList: readonly TokenListItem[] = [
    {cssVar: '--ndwu-radio-border-color', key: 'borderColor'},
    {cssVar: '--ndwu-radio-bg', key: 'bg'},
    {cssVar: '--ndwu-radio-label-color', key: 'labelColor'},
    {cssVar: '--ndwu-radio-secondary-text-color', key: 'secondaryTextColor'},
    {cssVar: '--ndwu-radio-checked-dot-color', key: 'checkedDotColor'},
    {cssVar: '--ndwu-radio-checked-border-color', key: 'checkedBorderColor'},
    {cssVar: '--ndwu-radio-checked-bg', key: 'checkedBg'},
    {cssVar: '--ndwu-radio-focus-border-color', key: 'focusBorderColor'},
    {cssVar: '--ndwu-radio-focus-bg', key: 'focusBg'},
    {cssVar: '--ndwu-radio-focus-color', key: 'focusColor'},
    {cssVar: '--ndwu-radio-disabled-bg', key: 'disabledBg'},
  ];

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<TokenPickerValues>({
    borderColor: '#000000',
    bg: '#000000',
    labelColor: '#000000',
    secondaryTextColor: '#000000',
    checkedDotColor: '#000000',
    checkedBorderColor: '#000000',
    checkedBg: '#000000',
    focusBorderColor: '#000000',
    focusBg: '#000000',
    focusColor: '#000000',
    disabledBg: '#000000',
  });

  protected override readonly tokenMapping: TokenMapping[] = [
    {key: 'borderColor', cssVar: '--ndwu-radio-border-color'},
    {key: 'bg', cssVar: '--ndwu-radio-bg'},
    {key: 'labelColor', cssVar: '--ndwu-radio-label-color'},
    {key: 'secondaryTextColor', cssVar: '--ndwu-radio-secondary-text-color'},
    {key: 'checkedDotColor', cssVar: '--ndwu-radio-checked-dot-color'},
    {key: 'checkedBorderColor', cssVar: '--ndwu-radio-checked-border-color'},
    {key: 'checkedBg', cssVar: '--ndwu-radio-checked-bg'},
    {key: 'focusBorderColor', cssVar: '--ndwu-radio-focus-border-color'},
    {key: 'focusBg', cssVar: '--ndwu-radio-focus-bg'},
    {key: 'focusColor', cssVar: '--ndwu-radio-focus-color'},
    {key: 'disabledBg', cssVar: '--ndwu-radio-disabled-bg'},
  ];

  public override resetSandbox(): void {
    this.applySandboxDisabled();
    super.resetSandbox();
  }

  private applySandboxDisabled(): void {
    const disabled = this.sandboxForm.controls.isDisabled.value;
    const optionCtrl = this.sandboxForm.controls.option;

    if (disabled) {
      if (optionCtrl.enabled) {
        optionCtrl.disable({emitEvent: false});
      }

      return;
    }

    if (optionCtrl.disabled) {
      optionCtrl.enable({emitEvent: false});
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
      option: 'option1',
      size: NDWU_SIZE.XL,
      isDisabled: false,
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return {
      borderColor: '',
      bg: '',
      labelColor: '',
      secondaryTextColor: '',
      checkedDotColor: '',
      checkedBorderColor: '',
      checkedBg: '',
      focusBorderColor: '',
      focusBg: '',
      focusColor: '',
      disabledBg: '',
    };
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

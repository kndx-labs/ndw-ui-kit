import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {NDWU_SIZE, NDWU_TOGGLE_COLOR, type NdwuSize, type NdwuToggleColor} from '@ndw-ui-kit/core';
import {NdwuToggleFieldComponent} from '@ndw-ui-kit/core/form-field';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

interface TokenPickerValues extends Record<string, string> {
  uncheckedBg: string;
  trackCheckedBg: string;
  trackCheckedHoverBg: string;
  trackCheckedActiveBg: string;
  trackDisabledBg: string;
  trackCheckedDisabledBg: string;
  knobBg: string;
  labelColor: string;
  secondaryTextColor: string;
  focusColor: string;
}

@Component({
  selector: 'app-toggle-sandbox-preview',
  templateUrl: './toggle-sandbox-preview.component.html',
  styleUrl: './toggle-sandbox-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuToggleFieldComponent,
    NdwuLocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class ToggleSandboxPreviewComponent extends SandboxBaseComponent {
  public readonly SIZE = NDWU_SIZE;
  public readonly TOGGLE_COLOR = NDWU_TOGGLE_COLOR;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly sandboxForm = new FormGroup({
    size: new FormControl<NdwuSize>(NDWU_SIZE.XL, {nonNullable: true}),
    color: new FormControl<NdwuToggleColor>(NDWU_TOGGLE_COLOR.BRAND, {nonNullable: true}),
    isDisabled: new FormControl<boolean>(false, {nonNullable: true}),
    label: new FormControl<string>('Enable notifications', {nonNullable: true}),
    secondaryText: new FormControl<string>('Receive updates about your account activity', {nonNullable: true}),
    toggleValue: new FormControl<boolean>(false, {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup({
    uncheckedBg: new FormControl<string>('', {nonNullable: true}),
    trackCheckedBg: new FormControl<string>('', {nonNullable: true}),
    trackCheckedHoverBg: new FormControl<string>('', {nonNullable: true}),
    trackCheckedActiveBg: new FormControl<string>('', {nonNullable: true}),
    trackDisabledBg: new FormControl<string>('', {nonNullable: true}),
    trackCheckedDisabledBg: new FormControl<string>('', {nonNullable: true}),
    knobBg: new FormControl<string>('', {nonNullable: true}),
    labelColor: new FormControl<string>('', {nonNullable: true}),
    secondaryTextColor: new FormControl<string>('', {nonNullable: true}),
    focusColor: new FormControl<string>('', {nonNullable: true}),
  });

  public readonly tokenList: readonly TokenListItem[] = [
    {cssVar: '--ndwu-toggle-brand-track-unchecked-bg', key: 'uncheckedBg'},
    {cssVar: '--ndwu-toggle-brand-track-checked-bg', key: 'trackCheckedBg'},
    {cssVar: '--ndwu-toggle-brand-track-checked-hover-bg', key: 'trackCheckedHoverBg'},
    {cssVar: '--ndwu-toggle-brand-track-checked-active-bg', key: 'trackCheckedActiveBg'},
    {cssVar: '--ndwu-toggle-track-disabled-bg', key: 'trackDisabledBg'},
    {cssVar: '--ndwu-toggle-track-checked-disabled-bg', key: 'trackCheckedDisabledBg'},
    {cssVar: '--ndwu-toggle-knob-bg', key: 'knobBg'},
    {cssVar: '--ndwu-toggle-label-color', key: 'labelColor'},
    {cssVar: '--ndwu-toggle-secondary-text-color', key: 'secondaryTextColor'},
    {cssVar: '--ndwu-toggle-focus-color', key: 'focusColor'},
  ];

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<TokenPickerValues>({
    uncheckedBg: '#000000',
    trackCheckedBg: '#000000',
    trackCheckedHoverBg: '#000000',
    trackCheckedActiveBg: '#000000',
    trackDisabledBg: '#000000',
    trackCheckedDisabledBg: '#000000',
    knobBg: '#000000',
    labelColor: '#000000',
    secondaryTextColor: '#000000',
    focusColor: '#000000',
  });

  protected override readonly tokenMapping: TokenMapping[] = [
    {key: 'uncheckedBg', cssVar: '--ndwu-toggle-brand-track-unchecked-bg'},
    {key: 'trackCheckedBg', cssVar: '--ndwu-toggle-brand-track-checked-bg'},
    {key: 'trackCheckedHoverBg', cssVar: '--ndwu-toggle-brand-track-checked-hover-bg'},
    {key: 'trackCheckedActiveBg', cssVar: '--ndwu-toggle-brand-track-checked-active-bg'},
    {key: 'trackDisabledBg', cssVar: '--ndwu-toggle-track-disabled-bg'},
    {key: 'trackCheckedDisabledBg', cssVar: '--ndwu-toggle-track-checked-disabled-bg'},
    {key: 'knobBg', cssVar: '--ndwu-toggle-knob-bg'},
    {key: 'labelColor', cssVar: '--ndwu-toggle-label-color'},
    {key: 'secondaryTextColor', cssVar: '--ndwu-toggle-secondary-text-color'},
    {key: 'focusColor', cssVar: '--ndwu-toggle-focus-color'},
  ];

  protected override onInit(): void {
    this.applySandboxDisabled();
    this.sandboxForm.controls.isDisabled.valueChanges.subscribe(() => this.applySandboxDisabled());
  }

  public override resetSandbox(): void {
    this.applySandboxDisabled();
    super.resetSandbox();
  }

  private applySandboxDisabled(): void {
    const disabled = this.sandboxForm.controls.isDisabled.value;
    const toggleCtrl = this.sandboxForm.controls.toggleValue;

    if (disabled && toggleCtrl.enabled) {
      toggleCtrl.disable({emitEvent: false});

      return;
    }

    if (!disabled && toggleCtrl.disabled) {
      toggleCtrl.enable({emitEvent: false});
    }
  }

  protected getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement;
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      toggleValue: false,
      size: NDWU_SIZE.XL,
      color: NDWU_TOGGLE_COLOR.BRAND,
      isDisabled: false,
      label: 'Enable notifications',
      secondaryText: 'Receive updates about your account activity',
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return {
      uncheckedBg: '',
      trackCheckedBg: '',
      trackCheckedHoverBg: '',
      trackCheckedActiveBg: '',
      trackDisabledBg: '',
      trackCheckedDisabledBg: '',
      knobBg: '',
      labelColor: '',
      secondaryTextColor: '',
      focusColor: '',
    };
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

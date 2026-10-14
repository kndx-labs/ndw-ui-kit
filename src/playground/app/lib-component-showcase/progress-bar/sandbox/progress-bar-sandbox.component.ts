import {ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NDWU_PROGRESS_BAR_COLOR, NDWU_SIZE, NdwuProgressBarComponent, type NdwuSize} from '@ndw-ui-kit/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent, type TokenListItem} from '@app/components';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

const COLOR_VAR = '--ndwu-progress-bar-track-bg';
const FILL_PRIMARY_VAR = '--ndwu-progress-bar-fill-primary';
const FILL_SUCCESS_VAR = '--ndwu-progress-bar-fill-success';
const FILL_DANGER_VAR = '--ndwu-progress-bar-fill-danger';
const FILL_WARNING_VAR = '--ndwu-progress-bar-fill-warning';

const DEFAULT_COLOR = '#e6edf7';
const DEFAULT_PRIMARY = '#1b84e7';
const DEFAULT_SUCCESS = '#22c55e';
const DEFAULT_DANGER = '#ef4444';
const DEFAULT_WARNING = '#f59e0b';

const DEFAULT_FORM_VALUES = {
  value: 50,
  max: 100,
  size: 'XL',
  color: 'primary',
  disabled: false,
  mode: 'determinate',
};

@Component({
  selector: 'app-progress-bar-sandbox',
  templateUrl: './progress-bar-sandbox.component.html',
  styleUrl: './progress-bar-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuProgressBarComponent,
    NdwuLocalizePipe,
    ThemeSwitcherComponent,
  ],
})
export class ProgressBarSandboxComponent extends SandboxBaseComponent {
  public readonly SIZE = NDWU_SIZE;
  public readonly PROGRESS_BAR_COLOR = NDWU_PROGRESS_BAR_COLOR;

  public readonly tokenList: readonly TokenListItem[] = [
    {cssVar: COLOR_VAR, key: 'trackBg'},
    {cssVar: FILL_PRIMARY_VAR, key: 'fillPrimary'},
    {cssVar: FILL_SUCCESS_VAR, key: 'fillSuccess'},
    {cssVar: FILL_DANGER_VAR, key: 'fillDanger'},
    {cssVar: FILL_WARNING_VAR, key: 'fillWarning'},
  ];

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly sandboxForm = new FormGroup({
    value: new FormControl<number>(50, {nonNullable: true}),
    max: new FormControl<number>(100, {nonNullable: true}),
    size: new FormControl<string>('XL', {nonNullable: true}),
    color: new FormControl<string>('primary', {nonNullable: true}),
    disabled: new FormControl<boolean>(false, {nonNullable: true}),
    mode: new FormControl<string>('determinate', {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup({
    trackBg: new FormControl<string>('', {nonNullable: true}),
    fillPrimary: new FormControl<string>('', {nonNullable: true}),
    fillSuccess: new FormControl<string>('', {nonNullable: true}),
    fillDanger: new FormControl<string>('', {nonNullable: true}),
    fillWarning: new FormControl<string>('', {nonNullable: true}),
  });

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  protected override readonly tokenMapping: TokenMapping[] = [
    {key: 'trackBg', cssVar: COLOR_VAR, defaultColor: DEFAULT_COLOR},
    {key: 'fillPrimary', cssVar: FILL_PRIMARY_VAR, defaultColor: DEFAULT_PRIMARY},
    {key: 'fillSuccess', cssVar: FILL_SUCCESS_VAR, defaultColor: DEFAULT_SUCCESS},
    {key: 'fillDanger', cssVar: FILL_DANGER_VAR, defaultColor: DEFAULT_DANGER},
    {key: 'fillWarning', cssVar: FILL_WARNING_VAR, defaultColor: DEFAULT_WARNING},
  ];

  public getColor(): string {
    const colorMap: Record<string, string> = {
      primary: NDWU_PROGRESS_BAR_COLOR.PRIMARY,
      success: NDWU_PROGRESS_BAR_COLOR.SUCCESS,
      danger: NDWU_PROGRESS_BAR_COLOR.DANGER,
      warning: NDWU_PROGRESS_BAR_COLOR.WARNING,
    };

    return colorMap[this.sandboxForm.controls.color.value] || NDWU_PROGRESS_BAR_COLOR.PRIMARY;
  }

  public getSize(): NdwuSize {
    const sizeMap: Record<string, NdwuSize> = {
      L: NDWU_SIZE.L,
      XL: NDWU_SIZE.XL,
    };

    return sizeMap[this.sandboxForm.controls.size.value] || NDWU_SIZE.XL;
  }

  public getMode(): 'determinate' | 'indeterminate' {
    return this.sandboxForm.controls.mode.value === 'indeterminate' ? 'indeterminate' : 'determinate';
  }

  public isDisabled(): boolean {
    return this.sandboxForm.controls.disabled.value;
  }

  protected override getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement;
  }

  protected override onInit(): void {
    this.sandboxForm.setValue(DEFAULT_FORM_VALUES);
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return DEFAULT_FORM_VALUES;
  }

  protected override getTokenResetValues(): Record<string, string> {
    return {
      trackBg: '',
      fillPrimary: '',
      fillSuccess: '',
      fillDanger: '',
      fillWarning: '',
    };
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

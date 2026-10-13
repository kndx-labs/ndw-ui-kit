import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NDWU_CHIP_STATUS,
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuChipComponent,
  type NdwuChipStatus,
  type NdwuIconName,
  type NdwuSize,
} from '@ndw-ui-kit/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {CssUtils} from '@app/utils';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

const CHIP_COLOR_TOKENS = [
  'chip-override-bg',
  'chip-override-border',
  'chip-override-fg',
  'chip-override-accent',
] as const;

const CHIP_STATUS_OPTIONS: {id: NdwuChipStatus; label: string}[] = [
  {id: NDWU_CHIP_STATUS.DEFAULT, label: 'default'},
  {id: NDWU_CHIP_STATUS.POSITIVE, label: 'positive'},
  {id: NDWU_CHIP_STATUS.NEGATIVE, label: 'negative'},
];

const CHIP_ICON_OPTIONS: NdwuIconName[] = [
  NDWU_ICON_NAME.DOWNLOAD_S,
  NDWU_ICON_NAME.CHECK_S,
  NDWU_ICON_NAME.CLOSE_S,
  NDWU_ICON_NAME.INFO_S,
  NDWU_ICON_NAME.WARNING_S,
];

const TOKEN_TO_CSS_VAR: Record<string, string> = {
  'chip-override-bg': '--ndwu-chip-override-bg',
  'chip-override-border': '--ndwu-chip-override-border',
  'chip-override-fg': '--ndwu-chip-override-fg',
  'chip-override-accent': '--ndwu-chip-override-accent',
};

const TOKEN_TO_READ_CSS_VAR: Record<string, string> = {
  'chip-override-bg': '--ndwu-chip-bg',
  'chip-override-border': '--ndwu-chip-border',
  'chip-override-fg': '--ndwu-chip-fg',
  'chip-override-accent': '--ndwu-chip-accent',
};

const DEFAULT_LABEL = 'Chip label';

function tokenKeyToCssVar(key: string): string {
  return CssUtils.tokenKeyToCssVar(key);
}

@Component({
  selector: 'app-chip-sandbox',
  templateUrl: './chip-sandbox.component.html',
  styleUrl: './chip-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuChipComponent,
    NdwuLocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class ChipSandboxComponent extends SandboxBaseComponent {
  public readonly SIZE = NDWU_SIZE;
  public readonly ICON_NAME = NDWU_ICON_NAME;
  public readonly CHIP_STATUS_OPTIONS = CHIP_STATUS_OPTIONS;
  public readonly CHIP_ICON_OPTIONS = CHIP_ICON_OPTIONS;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly sandboxForm = new FormGroup({
    label: new FormControl<string>(DEFAULT_LABEL, {nonNullable: true}),
    status: new FormControl<NdwuChipStatus>(NDWU_CHIP_STATUS.DEFAULT, {nonNullable: true}),
    size: new FormControl<NdwuSize>(NDWU_SIZE.XL, {nonNullable: true}),
    icon: new FormControl<NdwuIconName | null>(NDWU_ICON_NAME.DOWNLOAD_S, {nonNullable: true}),
    disabled: new FormControl<boolean>(false, {nonNullable: true}),
    loading: new FormControl<boolean>(false, {nonNullable: true}),
    ariaLabel: new FormControl<string>('', {nonNullable: true}),
    maxWidth: new FormControl<string>('', {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      CHIP_COLOR_TOKENS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ) as Record<(typeof CHIP_COLOR_TOKENS)[number], FormControl<string>>,
  );

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  protected override readonly tokenMapping: TokenMapping[] = CHIP_COLOR_TOKENS.map((key) => ({
    key,
    cssVar: TOKEN_TO_CSS_VAR[key] ?? '',
    readCssVar: TOKEN_TO_READ_CSS_VAR[key],
  }));

  public tokenListForCurrentType(): readonly TokenListItem[] {
    return CHIP_COLOR_TOKENS.map((key) => ({
      cssVar: tokenKeyToCssVar(key),
      key,
    }));
  }

  protected override getPreviewElement(): HTMLElement | undefined {
    const surfaceEl = this.previewSurface()?.nativeElement;

    return surfaceEl?.querySelector('button[ndwu-chip]') as HTMLElement | undefined;
  }

  protected override onInit(): void {
    this.sandboxForm.controls.status.valueChanges.subscribe(() => {
      this.sandboxTokens.reset(this.getTokenResetValues());
    });
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      label: DEFAULT_LABEL,
      status: NDWU_CHIP_STATUS.DEFAULT,
      size: NDWU_SIZE.XL,
      icon: NDWU_ICON_NAME.DOWNLOAD_S,
      disabled: false,
      loading: false,
      ariaLabel: '',
      maxWidth: '',
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return Object.fromEntries(CHIP_COLOR_TOKENS.map((key) => [key, '']));
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

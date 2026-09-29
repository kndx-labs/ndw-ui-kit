import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuBadgeComponent,
  type NdwuBadgeTone,
  type NdwuIconName,
  type NdwuSize,
} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {CssUtils} from '@app/utils';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

const BADGE_COLOR_TOKENS = [
  'badge-override-bg',
  'badge-override-border',
  'badge-override-fg',
] as const;

const BADGE_TONE_OPTIONS: {id: NdwuBadgeTone; label: string}[] = [
  {id: 'gray', label: 'gray'},
  {id: 'negative', label: 'negative'},
  {id: 'positive', label: 'positive'},
  {id: 'warning', label: 'warning'},
  {id: 'blue', label: 'blue'},
  {id: 'violet', label: 'violet'},
  {id: 'cyan', label: 'cyan'},
  {id: 'white', label: 'white'},
];

const BADGE_ICON_OPTIONS: NdwuIconName[] = [
  NDWU_ICON_NAME.BELL_ON_S,
  NDWU_ICON_NAME.INFO_S,
  NDWU_ICON_NAME.CHECK_S,
  NDWU_ICON_NAME.CLOSE_S,
  NDWU_ICON_NAME.WARNING_S,
];

const TOKEN_TO_CSS_VAR: Record<string, string> = {
  'badge-override-bg': '--ndwu-badge-override-bg',
  'badge-override-border': '--ndwu-badge-override-border',
  'badge-override-fg': '--ndwu-badge-override-fg',
};

const TOKEN_TO_READ_CSS_VAR: Record<string, string> = {
  'badge-override-bg': '--ndwu-badge-bg',
  'badge-override-border': '--ndwu-badge-border',
  'badge-override-fg': '--ndwu-badge-fg',
};

function tokenKeyToCssVar(key: string): string {
  return CssUtils.tokenKeyToCssVar(key);
}

@Component({
  selector: 'app-badge-sandbox',
  templateUrl: './badge-sandbox.component.html',
  styleUrl: './badge-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuBadgeComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class BadgeSandboxComponent extends SandboxBaseComponent {
  public readonly SIZE = NDWU_SIZE;
  public readonly ICON_NAME = NDWU_ICON_NAME;
  public readonly BADGE_TONE_OPTIONS = BADGE_TONE_OPTIONS;
  public readonly BADGE_ICON_OPTIONS = BADGE_ICON_OPTIONS;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly sandboxForm = new FormGroup({
    label: new FormControl<string>('Badge label', {nonNullable: true}),
    tone: new FormControl<NdwuBadgeTone>('gray', {nonNullable: true}),
    size: new FormControl<NdwuSize>(NDWU_SIZE.L, {nonNullable: true}),
    icon: new FormControl<NdwuIconName | null>(null, {nonNullable: true}),
    ariaLabel: new FormControl<string>('', {nonNullable: true}),
    maxWidth: new FormControl<string>('', {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      BADGE_COLOR_TOKENS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ) as Record<(typeof BADGE_COLOR_TOKENS)[number], FormControl<string>>,
  );

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  protected override readonly tokenMapping: TokenMapping[] = BADGE_COLOR_TOKENS.map((key) => ({
    key,
    cssVar: TOKEN_TO_CSS_VAR[key] ?? '',
    readCssVar: TOKEN_TO_READ_CSS_VAR[key],
  }));

  public tokenListForCurrentType(): readonly TokenListItem[] {
    return BADGE_COLOR_TOKENS.map((key) => ({
      cssVar: tokenKeyToCssVar(key),
      key,
    }));
  }

  protected override getPreviewElement(): HTMLElement | undefined {
    const surfaceEl = this.previewSurface()?.nativeElement;

    return surfaceEl?.querySelector('ndwu-badge') as HTMLElement | undefined;
  }

  protected override onInit(): void {
    this.sandboxForm.controls.tone.valueChanges.subscribe(() => {
      this.sandboxTokens.reset({
        'badge-override-bg': '',
        'badge-override-border': '',
        'badge-override-fg': '',
      });
    });
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      label: 'Badge label',
      tone: 'gray',
      size: NDWU_SIZE.L,
      icon: null,
      ariaLabel: '',
      maxWidth: '',
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return Object.fromEntries(BADGE_COLOR_TOKENS.map((key) => [key, '']));
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

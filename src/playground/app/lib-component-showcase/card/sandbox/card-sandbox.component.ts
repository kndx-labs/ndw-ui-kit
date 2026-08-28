import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NdwuCardComponent} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {CssUtils} from '@app/utils';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

export const CARD_STATE = {
  DEFAULT: 'default',
  HOVER: 'hover',
  FOCUSED: 'focused',
  DISABLED: 'disabled',
} as const;

export type CardState = (typeof CARD_STATE)[keyof typeof CARD_STATE];

const CARD_STATE_CSS_CLASS: Record<CardState, string> = {
  [CARD_STATE.DEFAULT]: '',
  [CARD_STATE.HOVER]: 'ndwu-card--state-hover',
  [CARD_STATE.FOCUSED]: 'ndwu-card--state-focused',
  [CARD_STATE.DISABLED]: 'ndwu-card--state-disabled',
};

const CARD_TOKEN_KEYS = [
  'card-bg',
  'card-border-color',
  'card-color',
] as const;

const DEFAULT_COLORS: Record<string, string> = {
  'card-bg': '#FFFFFF',
  'card-border-color': '#D0D4DA',
  'card-color': '#1C2026',
};

@Component({
  selector: 'app-card-sandbox',
  templateUrl: './card-sandbox.component.html',
  styleUrl: './card-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuCardComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class CardSandboxComponent extends SandboxBaseComponent {
  public readonly CARD_STATE = CARD_STATE;

  public readonly tokenList: readonly TokenListItem[] = CARD_TOKEN_KEYS.map((key) => ({
    cssVar: CssUtils.tokenKeyToCssVar(key),
    key,
  }));

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      CARD_TOKEN_KEYS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ) as Record<(typeof CARD_TOKEN_KEYS)[number], FormControl<string>>,
  );

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  public readonly sandboxForm = new FormGroup({
    state: new FormControl<CardState>(CARD_STATE.DEFAULT, {nonNullable: true}),
  });

  protected override readonly tokenMapping: TokenMapping[] = CARD_TOKEN_KEYS.map((key) => ({
    key,
    cssVar: CssUtils.tokenKeyToCssVar(key),
    defaultColor: DEFAULT_COLORS[key],
  }));

  public get previewStateClass(): string {
    return CARD_STATE_CSS_CLASS[this.sandboxForm.controls.state.value];
  }

  protected getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement;
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {state: CARD_STATE.DEFAULT};
  }

  protected override getTokenResetValues(): Record<string, string> {
    return Object.fromEntries(CARD_TOKEN_KEYS.map((key) => [key, '']));
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

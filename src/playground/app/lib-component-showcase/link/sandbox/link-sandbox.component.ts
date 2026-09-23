import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ICON_NAME, type NdwuIconName, NdwuLinkComponent} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {CssUtils} from '@app/utils';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

export const LINK_STATE = {
  DEFAULT: 'default',
  HOVER: 'hover',
  PRESSED: 'pressed',
  FOCUSED: 'focused',
  VISITED: 'visited',
  DISABLED: 'disabled',
} as const;

export type LinkState = (typeof LINK_STATE)[keyof typeof LINK_STATE];

const LINK_STATE_CSS_CLASS: Record<LinkState, string> = {
  [LINK_STATE.DEFAULT]: '',
  [LINK_STATE.HOVER]: 'ndwu-link--state-hover',
  [LINK_STATE.PRESSED]: 'ndwu-link--state-pressed',
  [LINK_STATE.FOCUSED]: 'ndwu-link--state-focused',
  [LINK_STATE.VISITED]: 'ndwu-link--state-visited',
  [LINK_STATE.DISABLED]: '',
};

const LINK_TOKEN_KEYS = [
  'link-default-color',
  'link-hover-color',
  'link-active-color',
  'link-focus-color',
  'link-focus-outline',
  'link-visited-color',
  'link-disabled-color',
] as const;

function tokenKeyToCssVar(key: string): string {
  return CssUtils.tokenKeyToCssVar(key);
}

const SANDBOX_ICONS: NdwuIconName[] = [
  ICON_NAME.EXTERNAL_LINK_S,
  ICON_NAME.DOWNLOAD_S,
];

@Component({
  selector: 'app-link-sandbox',
  templateUrl: './link-sandbox.component.html',
  styleUrl: './link-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuLinkComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class LinkSandboxComponent extends SandboxBaseComponent {
  public readonly LINK_STATE = LINK_STATE;
  public readonly SANDBOX_ICONS = SANDBOX_ICONS;
  public readonly ICON_NAME = ICON_NAME;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly sandboxForm = new FormGroup({
    label: new FormControl<string>('https://example.com', {nonNullable: true}),
    href: new FormControl<string>('', {nonNullable: true}),
    state: new FormControl<LinkState>(LINK_STATE.DEFAULT, {nonNullable: true}),
    external: new FormControl<boolean>(true, {nonNullable: true}),
    icon: new FormControl<NdwuIconName>(ICON_NAME.EXTERNAL_LINK_S, {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      LINK_TOKEN_KEYS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ) as Record<(typeof LINK_TOKEN_KEYS)[number], FormControl<string>>,
  );

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  protected override readonly tokenMapping: TokenMapping[] = LINK_TOKEN_KEYS.map((key) => ({
    key,
    cssVar: tokenKeyToCssVar(key),
  }));

  public tokenListForCurrentType(): readonly TokenListItem[] {
    return LINK_TOKEN_KEYS.map((key) => ({cssVar: tokenKeyToCssVar(key), key}));
  }

  public get previewStateClass(): string {
    return LINK_STATE_CSS_CLASS[this.sandboxForm.controls.state.value];
  }

  public get isPreviewDisabled(): boolean {
    return this.sandboxForm.controls.state.value === LINK_STATE.DISABLED;
  }

  protected getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement;
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      label: 'Link text',
      href: '#',
      state: LINK_STATE.DEFAULT,
      external: true,
      icon: ICON_NAME.EXTERNAL_LINK_S,
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return Object.fromEntries(LINK_TOKEN_KEYS.map((key) => [key, '']));
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

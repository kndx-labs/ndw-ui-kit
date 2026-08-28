import {ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {OverlayContainer} from '@angular/cdk/overlay';
import {NdwuButtonComponent, NdwuPopoverAlign, NdwuTooltipDirective} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NdwuTooltipPosition} from '@ndw-ui-kit/core/popover';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {CssUtils} from '@app/utils';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

const TOOLTIP_COLOR_TOKENS = [
  'tooltip-bg',
  'tooltip-color',
] as const;

const OVERLAY_PANEL_CLASS = 'ndwu-tooltip';

const DEFAULT_TEXT = 'Hover over me to see tooltip';

@Component({
  selector: 'app-tooltip-sandbox',
  templateUrl: './tooltip-sandbox.component.html',
  styleUrl: './tooltip-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuButtonComponent,
    NdwuTooltipDirective,
    ReactiveFormsModule,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class TooltipSandboxComponent extends SandboxBaseComponent {
  protected readonly tooltipPositionOptions: NdwuTooltipPosition[] = ['auto', 'above', 'below', 'left', 'right'];
  protected readonly tooltipAlignOptions: NdwuPopoverAlign[] = ['start', 'center', 'end'];

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');
  private readonly overlayContainer = inject(OverlayContainer);
  private readonly overlayObserver = new MutationObserver(() => {
    this.applyOverlayTokenStyles();
    this.scheduleTokenPickerRefresh();
  });

  public readonly sandboxForm = new FormGroup({
    text: new FormControl<string>(DEFAULT_TEXT, {nonNullable: true}),
    maxWidth: new FormControl<string>('', {nonNullable: true}),
    position: new FormControl<NdwuTooltipPosition>('auto', {nonNullable: true}),
    align: new FormControl<NdwuPopoverAlign>('center', {nonNullable: true}),
    showDelay: new FormControl<number>(300, {nonNullable: true}),
    hideDelay: new FormControl<number>(200, {nonNullable: true}),
    showOnTap: new FormControl<boolean>(false, {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      TOOLTIP_COLOR_TOKENS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ) as Record<(typeof TOOLTIP_COLOR_TOKENS)[number], FormControl<string>>,
  );

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  protected override readonly tokenMapping: TokenMapping[] = TOOLTIP_COLOR_TOKENS.map((key) => ({
    key,
    cssVar: CssUtils.tokenKeyToCssVar(key),
  }));

  public tokenListForCurrentType(): readonly TokenListItem[] {
    return TOOLTIP_COLOR_TOKENS.map((key) => ({
      cssVar: CssUtils.tokenKeyToCssVar(key),
      key,
    }));
  }

  protected override getPreviewElement(): HTMLElement | undefined {
    return this.getOverlayPane() ?? this.previewSurface()?.nativeElement;
  }

  protected override onTokenStylesComputed(): void {
    this.applyOverlayTokenStyles();
  }

  protected override onAfterViewInit(): void {
    this.overlayObserver.observe(this.overlayContainer.getContainerElement(), {childList: true, subtree: true});
    this.destroyRef.onDestroy(() => this.overlayObserver.disconnect());
    this.applyOverlayTokenStyles();
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      text: DEFAULT_TEXT,
      maxWidth: '',
      position: 'auto',
      align: 'center',
      showDelay: 300,
      hideDelay: 200,
      showOnTap: false,
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return Object.fromEntries(TOOLTIP_COLOR_TOKENS.map((key) => [key, '']));
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }

  private getOverlayPane(): HTMLElement | undefined {
    return document.querySelector<HTMLElement>(`.cdk-overlay-pane.${OVERLAY_PANEL_CLASS}`) ?? undefined;
  }

  private applyOverlayTokenStyles(): void {
    const pane = this.getOverlayPane();

    if (!pane) {
      return;
    }

    for (const [cssVar, value] of Object.entries(this.sandboxTokenStyles())) {
      if (value === null) {
        pane.style.removeProperty(cssVar);
      } else {
        pane.style.setProperty(cssVar, value);
      }
    }
  }
}

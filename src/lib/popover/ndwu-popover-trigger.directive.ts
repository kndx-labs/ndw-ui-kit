import {
  Directive,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  type Provider,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {normalizeClass} from '@ndw-ui-kit/core/utils';
import {
  NDWU_POPOVER_CONTROLLER_FACTORY,
  type NdwuPopoverController,
  type NdwuPopoverControllerFactory,
} from './ndwu-popover-controller';
import {NDWU_POPOVER_DEFAULT_CONTENT, NDWU_POPOVER_TRIGGER_DEFAULTS} from './ndwu-popover.tokens';
import type {
  NdwuDynamicContent,
  NdwuPopoverConfig,
  NdwuPopoverOrigin,
  NdwuPopoverTriggerType,
} from './ndwu-popover.types';
import {NdwuTapGestureDetector} from './ndwu-tap-gesture-detector';
import {NdwuPopoverInteractionController, type NdwuPopoverInteractionCtx} from './ndwu-popover-interaction-controller';

export interface NdwuOverlayConfig {
  providers: Provider[];
  controllerConfig?: Record<string, unknown>;
  /** Default overlay origin; an `originPoint`/`originElement` passed to `open()` takes precedence. */
  originPoint?: NdwuPopoverConfig['originPoint'];
  originElement?: NdwuPopoverConfig['originElement'];
}

/**
 * Generic directive that can be placed on any trigger element to open an overlay (popover).
 * Supports template-driven usage (via inputs) or imperative API (open/close/toggle with config).
 * No hardcoded ARIA — consumers configure via host bindings.
 *
 * The overlay controller factory can be provided in two ways:
 * 1. `[popoverControllerFactory]` input — preferred for direct usage in templates.
 * 2. `NDWU_POPOVER_CONTROLLER_FACTORY` DI token — used by wrapper directives (e.g. ndwuTooltip).
 * Input takes precedence. If neither is provided, `open()` throws.
 */
@Directive({
  selector: '[ndwuPopoverTrigger]',
})
export class NdwuPopoverTriggerDirective implements OnDestroy {
  protected readonly injectedControllerFactory = inject(NDWU_POPOVER_CONTROLLER_FACTORY, {optional: true});
  protected readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly injector = inject(Injector);
  protected readonly defaultContentFactory = inject(NDWU_POPOVER_DEFAULT_CONTENT, {optional: true});
  protected readonly triggerDefaults = inject(NDWU_POPOVER_TRIGGER_DEFAULTS, {optional: true});
  protected readonly tapGestureDetector = inject(NdwuTapGestureDetector);

  /** Optional content for template-driven usage. When null, use imperative open()/toggle(). */
  public readonly ndwuPopoverTrigger = input<NdwuDynamicContent<unknown> | null>(null);

  /** Trigger type(s). Can combine e.g. ['hover', 'focus'] for tooltip. Fallback: trigger defaults token, then 'click'. */
  public readonly triggerOn = input<NdwuPopoverTriggerType | NdwuPopoverTriggerType[] | undefined>(undefined);

  /** Show delay in ms (hover/focus). Fallback: trigger defaults token, then 0. */
  public readonly showDelay = input<number | undefined>(undefined);

  /** Hide delay in ms (hover/focus). Fallback: trigger defaults token, then 150. */
  public readonly hideDelay = input<number | undefined>(undefined);

  /** Context for content (template-driven). */
  public readonly popoverContext = input<unknown>(undefined);

  /** Additional DI providers for overlay (template-driven). */
  public readonly popoverProviders = input<Provider[]>([]);

  /** CSS class(es) for overlay pane. Fallback: trigger defaults token, then []. */
  public readonly popoverClass = input<string | string[] | undefined>(undefined);

  /** Min width for desktop floating element. Default: 0. */
  public readonly popoverMinWidth = input<number>(0);

  /** Whether to trap focus in overlay. Fallback: trigger defaults token, then false. */
  public readonly popoverTrapFocus = input<boolean | undefined>(undefined);

  /** When true, clicking origin while open closes the popover. Only applies to 'click' trigger. Default: true. */
  public readonly popoverCloseOnOriginClick = input<boolean>(true);

  /** Disables the trigger. */
  public readonly disabled = input<boolean>(false);

  /**
   * When false (default), suppresses hover-triggered opening that is a direct result
   * of a recent tap on touch devices. When true, hover tooltips are allowed to open
   * on tap as well.
   */
  public readonly showOnTap = input<boolean>(false);

  /**
   * Optional controller factory for the overlay. Takes precedence over the
   * `NDWU_POPOVER_CONTROLLER_FACTORY` DI token. Use this input for direct
   * usage (e.g. `[popoverControllerFactory]="createDropdownController"`). The DI
   * token path is used by wrapper directives like `ndwuTooltip`.
   */
  public readonly popoverControllerFactory = input<NdwuPopoverControllerFactory | undefined>(undefined);

  protected readonly effectiveTriggerOn = computed<NdwuPopoverTriggerType | NdwuPopoverTriggerType[]>(() => {
    return this.triggerOn() ?? this.triggerDefaults?.triggerOn ?? ['click'];
  });

  protected readonly effectiveShowDelay = computed<number>(() => {
    return this.showDelay() ?? this.triggerDefaults?.showDelay ?? 0;
  });

  protected readonly effectiveHideDelay = computed<number>(() => {
    return this.hideDelay() ?? this.triggerDefaults?.hideDelay ?? 150;
  });

  protected readonly effectivePopoverClass = computed<string | string[]>(() => {
    return this.popoverClass() ?? this.triggerDefaults?.popoverClass ?? [];
  });

  protected readonly effectivePopoverTrapFocus = computed<boolean>(() => {
    return this.popoverTrapFocus() ?? this.triggerDefaults?.popoverTrapFocus ?? false;
  });

  public readonly opened = output<void>();
  public readonly closed = output<void>();

  public readonly isOpen = signal<boolean>(false);

  protected controller: NdwuPopoverController | null = null;

  protected overlayConfigFactory: (() => NdwuOverlayConfig) | null = null;

  // Set by scheduleShow(): the next open registers the hover bridge even without a hover/focus trigger.
  protected bridgeNextOpen = false;

  public registerOverlayConfig(factory: () => NdwuOverlayConfig): void {
    this.overlayConfigFactory = factory;
  }

  protected readonly interaction: NdwuPopoverInteractionController = new NdwuPopoverInteractionController(
    this.injector,
    {
      isOpen: () => this.isOpen(),
      hasTriggerType: (t) => this.hasTriggerType(t),
      getOverlayElement: () => this.controller?.getOverlayElement() ?? null,
      getTriggerElement: () => this.elementRef.nativeElement as HTMLElement,

      getShowDelay: () => this.effectiveShowDelay(),
      show: () => this.tryOpenFromHoverOrFocus(),

      getHideDelay: () => this.effectiveHideDelay(),
      hide: () => this.close({focusOrigin: false}),
    } satisfies NdwuPopoverInteractionCtx,
  );

  @HostListener('click')
  protected onClick(): void {
    if (this.disabled() || !this.hasTriggerType('click')) {
      return;
    }

    const content = this.resolveContent();

    if (content) {
      this.toggle();
    }
  }

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();

      return;
    }

    if (!this.hasTriggerType('click')) {
      return;
    }

    if (this.isTextInputTarget(event.target as HTMLElement)) {
      return;
    }

    if (this.isActivationKey(event)) {
      event.preventDefault();

      const content = this.resolveContent();

      if (content) {
        this.toggle();
      }
    }
  }

  @HostListener('mouseenter')
  protected onMouseEnter(): void {
    if (this.disabled() || !this.hasTriggerType('hover')) {
      return;
    }

    if (!this.showOnTap() && this.tapGestureDetector.isRecentTouch()) {
      return;
    }

    this.interaction.scheduleShow();
  }

  @HostListener('mouseleave')
  protected onMouseLeave(): void {
    if (this.hasTriggerType('hover')) {
      this.interaction.scheduleHide();
    }
  }

  @HostListener('focus')
  protected onFocus(): void {
    if (!this.disabled() && this.hasTriggerType('focus')) {
      this.interaction.scheduleShow();
    }
  }

  @HostListener('blur')
  protected onBlur(): void {
    if (this.hasTriggerType('focus')) {
      this.interaction.scheduleHide();
    }
  }

  public ngOnDestroy(): void {
    this.interaction.dispose();
    this.controller?.dispose();
    this.controller = null;
  }

  public open(config: NdwuPopoverConfig): void {
    if (this.disabled()) {
      return;
    }

    if (this.isOpen()) {
      // An explicit open wins over a hide scheduled earlier (e.g. pointer left, then focus came in).
      this.interaction.cancelScheduledHide();

      return;
    }

    const controller = this.ensureController();

    this.isOpen.set(true);

    controller.open(this.mergeOverlayConfig(config));
    this.opened.emit();

    if (this.bridgeNextOpen || this.hasTriggerType('hover') || this.hasTriggerType('focus')) {
      this.interaction.registerHoverBridge();
    }

    this.bridgeNextOpen = false;

    if (this.hasTriggerType('click')) {
      this.interaction.registerOutsideClickClose();
    }
  }

  public close(options?: {focusOrigin?: boolean}): void {
    // Before the controller guard: a show scheduled before the first open must be cancelled too.
    this.interaction.dispose();

    if (!this.controller) {
      return;
    }

    this.controller.close(options);
  }

  /**
   * Opens after `showDelay`, like a hover on the host. For triggers whose targets aren't the host
   * (e.g. `triggerOn="manual"` with one popover for many targets). When already open, only cancels
   * a pending hide, so moving between targets keeps the overlay open.
   */
  public scheduleShow(): void {
    if (this.disabled()) {
      return;
    }

    this.bridgeNextOpen = !this.isOpen();
    this.interaction.scheduleShow();
  }

  /** Closes after `hideDelay`, unless the pointer moves onto the overlay or `scheduleShow()` is called. */
  public scheduleHide(): void {
    this.interaction.scheduleHide();
  }

  /** Re-anchors the open overlay to another origin without closing it (if the controller supports it). */
  public setOrigin(origin: NdwuPopoverOrigin): void {
    if (this.isOpen()) {
      this.controller?.setOrigin(origin);
    }
  }

  /**
   * Toggle: open if closed, close if open.
   * Uses config when opening (imperative) or current inputs (template-driven).
   */
  public toggle(config?: NdwuPopoverConfig): void {
    if (this.disabled()) {
      return;
    }

    if (this.isOpen()) {
      this.close();

      return;
    }

    if (config) {
      this.open(config);

      return;
    }

    const resolvedContent = this.resolveContent();

    if (resolvedContent) {
      this.open(this.buildContentConfig(resolvedContent));
    }
  }

  protected getOverlayElement(): HTMLElement | null {
    return this.controller?.getOverlayElement() ?? null;
  }

  protected hasTriggerType(type: NdwuPopoverTriggerType): boolean {
    const on = this.effectiveTriggerOn();
    const arr = Array.isArray(on) ? on : [on];

    return arr.includes(type);
  }

  protected resolveContent(): NdwuDynamicContent<unknown> | null {
    return this.ndwuPopoverTrigger() ?? this.defaultContentFactory?.() ?? null;
  }

  protected isTextInputTarget(target: HTMLElement): boolean {
    return (
      target.tagName === 'INPUT'
      || target.tagName === 'TEXTAREA'
      || target.isContentEditable
    );
  }

  protected isActivationKey(event: KeyboardEvent): boolean {
    return event.key === ' ' || event.key === 'Enter';
  }

  protected ensureController(): NdwuPopoverController {
    if (!this.controller) {
      const factory = this.popoverControllerFactory() ?? this.injectedControllerFactory;

      if (!factory) {
        const chunks = [
          'NdwuPopoverTriggerDirective: no controller factory provided.',
          'Pass [popoverControllerFactory] input or provide NDWU_POPOVER_CONTROLLER_FACTORY token.',
        ];

        throw new Error(chunks.join(' '));
      }

      this.controller = factory(
        this.elementRef as ElementRef<HTMLElement>,
        this.injector,
        () => {
          this.isOpen.set(false);
          this.closed.emit();
        },
      );
    }

    return this.controller;
  }

  protected buildContentConfig(content: NdwuDynamicContent<unknown>): NdwuPopoverConfig {
    return this.mergeOverlayConfig({content});
  }

  /**
   * Merges the caller's config with overlay providers/controllerConfig registered
   * by wrapper directives (e.g. ndwuTooltip), plus trigger-level defaults.
   */
  protected mergeOverlayConfig(
    overrides: NdwuPopoverConfig & Pick<NdwuPopoverConfig, 'content'>,
  ): NdwuPopoverConfig {
    const overlayConfig = this.overlayConfigFactory?.();
    const extraProviders = overlayConfig?.providers ?? [];
    // An origin passed to open() replaces the wrapper's default origin as a whole.
    const hasOverrideOrigin = overrides.originPoint !== undefined || overrides.originElement !== undefined;
    const originSource = hasOverrideOrigin ? overrides : overlayConfig;
    const originPoint = originSource?.originPoint;
    const originElement = originSource?.originElement;

    return {
      content: overrides.content,
      context: overrides.context ?? this.popoverContext(),
      providers: [...this.popoverProviders(), ...(overrides.providers ?? []), ...extraProviders],
      panelClass: overrides.panelClass ?? normalizeClass(this.effectivePopoverClass(), ''),
      minWidth: overrides.minWidth ?? this.popoverMinWidth(),
      trapFocus: overrides.trapFocus ?? this.effectivePopoverTrapFocus(),
      closeOnOriginClick: overrides.closeOnOriginClick ?? this.popoverCloseOnOriginClick(),
      ...(originPoint !== undefined ? {originPoint} : {}),
      ...(originElement !== undefined ? {originElement} : {}),
      ...(overlayConfig?.controllerConfig !== undefined
        ? {controllerConfig: overlayConfig.controllerConfig}
        : {}),
    };
  }

  protected tryOpenFromHoverOrFocus(): void {
    if (this.disabled() || this.isOpen()) {
      return;
    }

    const resolvedContent = this.resolveContent();

    if (!resolvedContent) {
      return;
    }

    this.open(this.buildContentConfig(resolvedContent));
  }
}

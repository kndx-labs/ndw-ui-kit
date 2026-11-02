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
import {NdwuPopoverSession, type NdwuPopoverFinishState} from './ndwu-popover-session';

export interface NdwuOverlayConfig {
  providers: Provider[];
  controllerConfig?: Record<string, unknown>;
  restoreFocus?: boolean;
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
   * usage (e.g. `[popoverControllerFactory]="ndwuCreateDropdownController"`). The DI
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

  protected session: NdwuPopoverSession | null = null;

  protected sessionConfig: NdwuPopoverConfig | null = null;

  protected sessionOpened = false;

  protected focusSnapshot: Element | null = null;

  protected overlayConfigFactory: (() => NdwuOverlayConfig) | null = null;

  protected bridgeNextOpen = false;

  protected originHovered = false;

  protected restoringFocus = false;

  public registerOverlayConfig(factory: () => NdwuOverlayConfig): void {
    this.overlayConfigFactory = factory;
  }

  protected readonly interaction: NdwuPopoverInteractionController = new NdwuPopoverInteractionController(
    {
      isOpen: () => this.isOpen(),
      hasTriggerType: (t) => this.hasTriggerType(t),
      getSession: () => this.session,
      getOverlayElement: () => this.controller?.getOverlayElement() ?? null,
      getTriggerElement: () => this.elementRef.nativeElement as HTMLElement,
      isOriginHovered: () => this.originHovered,

      getShowDelay: () => this.effectiveShowDelay(),
      show: (bridge) => this.tryOpenFromHoverOrFocus(bridge),

      getHideDelay: () => this.effectiveHideDelay(),
      hide: () => this.session?.finish('hover'),
      dismissOutside: () => this.session?.finish('outside'),
    } satisfies NdwuPopoverInteractionCtx,
  );

  @HostListener('click')
  protected onClick(): void {
    if (this.disabled() || !this.hasTriggerType('click')) {
      return;
    }

    if (this.isOpen() && this.sessionConfig?.closeOnOriginClick === false) {
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
      event.stopPropagation();
      this.session?.finish('escape');

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
    this.originHovered = true;

    if (this.disabled() || !this.hasTriggerType('hover')) {
      return;
    }

    if (!this.showOnTap() && this.tapGestureDetector.isRecentTouch()) {
      return;
    }

    this.interaction.scheduleShow(false);
  }

  @HostListener('mouseleave')
  protected onMouseLeave(): void {
    this.originHovered = false;

    if (this.hasTriggerType('hover')) {
      this.interaction.scheduleHide();
    }
  }

  @HostListener('focus')
  protected onFocus(): void {
    if (this.restoringFocus) {
      return;
    }

    if (!this.disabled() && this.hasTriggerType('focus')) {
      this.interaction.scheduleShow(false);
    }
  }

  @HostListener('blur')
  protected onBlur(): void {
    if (this.hasTriggerType('focus')) {
      this.interaction.scheduleHide();
    }
  }

  public ngOnDestroy(): void {
    this.interaction.cancelScheduledShow();
    this.session?.finish('destroy');
  }

  public open(config: NdwuPopoverConfig): void {
    if (this.disabled()) {
      return;
    }

    if (this.isOpen()) {
      this.interaction.cancelScheduledHide();

      return;
    }

    const controller = this.ensureController();
    const resolved = this.resolveConfig(config);
    const session = this.startSession(controller, resolved);

    try {
      controller.open(resolved, session);
    } catch (error) {
      try {
        session.finish('error');
      } catch (_cleanupError) {}

      throw error;
    }

    if (!session.isActive()) {
      return;
    }

    this.sessionOpened = true;
    this.opened.emit();

    if (!session.isActive()) {
      return;
    }

    this.interaction.attach(session, {
      hoverBridge: this.bridgeNextOpen || this.hasTriggerType('hover') || this.hasTriggerType('focus'),
      outsideClick: this.hasTriggerType('click'),
      focusout: this.hasTriggerType('focus'),
    });
  }

  public close(options?: {focusOrigin?: boolean}): void {
    this.interaction.cancelScheduledShow();
    this.session?.finish('explicit', options?.focusOrigin);
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

    this.interaction.scheduleShow(!this.isOpen());
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
      this.open({content: resolvedContent});
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

      this.controller = factory(this.elementRef as ElementRef<HTMLElement>, this.injector);
    }

    return this.controller;
  }

  protected startSession(controller: NdwuPopoverController, resolved: NdwuPopoverConfig): NdwuPopoverSession {
    this.sessionConfig = resolved;
    this.focusSnapshot = document.activeElement;
    this.interaction.cancelScheduledShow();

    const session = new NdwuPopoverSession(
      this.injector,
      () => controller.getOverlayElement(),
      (finished, state) => this.onSessionFinished(finished, state),
    );

    this.session = session;
    this.sessionOpened = false;
    this.isOpen.set(true);

    return session;
  }

  protected resolveConfig(config: NdwuPopoverConfig): NdwuPopoverConfig {
    const wrapper = this.overlayConfigFactory?.();
    const hasCallerOrigin = config.originPoint !== undefined || config.originElement !== undefined;
    const originSource = hasCallerOrigin ? config : wrapper;
    const originPoint = originSource?.originPoint;
    const originElement = originSource?.originElement;
    const hasControllerConfig = wrapper?.controllerConfig !== undefined || config.controllerConfig !== undefined;

    return {
      content: config.content,
      context: config.context ?? this.popoverContext(),
      providers: [...this.popoverProviders(), ...(wrapper?.providers ?? []), ...(config.providers ?? [])],
      panelClass: config.panelClass ?? normalizeClass(this.effectivePopoverClass(), ''),
      minWidth: config.minWidth ?? this.popoverMinWidth(),
      trapFocus: config.trapFocus ?? this.effectivePopoverTrapFocus(),
      closeOnOriginClick: config.closeOnOriginClick ?? this.popoverCloseOnOriginClick(),
      restoreFocus: config.restoreFocus ?? wrapper?.restoreFocus ?? true,
      ...(originPoint !== undefined ? {originPoint} : {}),
      ...(originElement !== undefined ? {originElement} : {}),
      ...(hasControllerConfig ? {controllerConfig: {...wrapper?.controllerConfig, ...config.controllerConfig}} : {}),
    };
  }

  protected onSessionFinished(session: NdwuPopoverSession, state: NdwuPopoverFinishState): void {
    if (this.session !== session) {
      return;
    }

    const emitClosed = this.sessionOpened && state.reason !== 'destroy';
    const restore = this.shouldRestoreFocus(state);
    const snapshot = this.focusSnapshot;

    this.session = null;
    this.sessionConfig = null;
    this.sessionOpened = false;
    this.focusSnapshot = null;
    this.interaction.cancelScheduledShow();
    this.isOpen.set(false);

    if (restore) {
      this.restoreFocus(snapshot);
    }

    if (emitClosed) {
      this.closed.emit();
    }
  }

  protected shouldRestoreFocus(state: NdwuPopoverFinishState): boolean {
    if (this.sessionConfig?.restoreFocus === false) {
      return false;
    }

    switch (state.reason) {
      case 'explicit':
        return state.focusOrigin ?? true;
      case 'escape':
      case 'origin-click':
        return true;
      case 'hover':
        return state.focusInPane;
      case 'outside':
      case 'detached':
        return this.isFocusOrphaned(state);
      case 'destroy':
        return this.isFocusOrphaned(state) && this.elementRef.nativeElement.isConnected;
      case 'error':
        return false;
    }
  }

  protected isFocusOrphaned({focusInPane, focusLost}: NdwuPopoverFinishState): boolean {
    if (focusInPane) {
      return true;
    }

    if (!focusLost) {
      return false;
    }

    const snapshot = this.focusSnapshot;
    const heldFocus = snapshot !== null && snapshot !== document.body;

    return heldFocus || this.sessionConfig?.trapFocus === true;
  }

  protected restoreFocus(snapshot: Element | null): void {
    const host = this.elementRef.nativeElement as HTMLElement;

    this.restoringFocus = true;

    try {
      host.focus();

      if (document.activeElement !== host && snapshot instanceof HTMLElement && snapshot.isConnected) {
        snapshot.focus();
      }
    } finally {
      this.restoringFocus = false;
    }
  }

  protected tryOpenFromHoverOrFocus(bridge: boolean): void {
    if (this.disabled() || this.isOpen()) {
      return;
    }

    const resolvedContent = this.resolveContent();

    if (!resolvedContent) {
      return;
    }

    this.bridgeNextOpen = bridge;

    try {
      this.open({content: resolvedContent});
    } finally {
      this.bridgeNextOpen = false;
    }
  }
}

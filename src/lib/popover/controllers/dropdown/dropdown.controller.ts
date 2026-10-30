import {ElementRef, Injector, afterNextRender} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {type ConnectedOverlayPositionChange, Overlay, type OverlayRef} from '@angular/cdk/overlay';
import {Subscription} from 'rxjs';
import {NdwuPopoverController} from '../../ndwu-popover-controller';
import type {NdwuPopoverConfig} from '../../ndwu-popover.types';
import {MobileScrollLockStrategy} from '../../mobile-scroll-lock.strategy';
import {HANDSET_BREAKPOINT, applyThemeClass, detectThemeClass, normalizeClass} from '@ndw-ui-kit/core/utils';
import {registerOverlayScroll} from '../../overlay-utils';

const OFFSET_DROPDOWN = 4;
const OFFSET_DROPUP = -12;

const VIEWPORT_MARGIN = 8; // viewport margin (px) kept between overlay and viewport edge.
const FULL_PANEL_HEIGHT = 320; // preferred full height of options panel; used to decide on flip vs shrink.
const MIN_PANEL_HEIGHT = 120; // minimum overlay height when shrinking so the panel remains usable

const BACKDROP_BASE_CLASS = 'ndwu-dropdown-backdrop';
const DEFAULT_PANEL_CLASS = 'ndwu-dropdown-panel-tpl';
const ABOVE_PANEL_CLASS = `${DEFAULT_PANEL_CLASS}--above`;

/**
 * Overlay controller: opens a dropdown (desktop) or bottom sheet (mobile)
 * from any origin element. Renders content via NdwuPopoverHostComponent.
 */
export class NdwuDropdownController extends NdwuPopoverController {
  protected positionChangesSubscription: Subscription | null = null;

  // used for max-height when opening with originPoint; cleared on detach.
  protected lastOriginRect: {top: number; bottom: number} | null = null;
  // virtual origin element at cursor when using originPoint; removed on detach.
  protected virtualOriginElement: HTMLElement | null = null;
  // set to `true` when overlay was opened with originPoint (cursor context menu);
  // used for 'click outside' detection
  protected isOriginPointMode = false;

  protected savedOverscrollBehavior = '';

  constructor(
    protected readonly overlay: Overlay,
    protected readonly breakpointObserver: BreakpointObserver,
    protected readonly elementRef: ElementRef<HTMLElement>,
    protected readonly injector: Injector,
    protected readonly onOverlayDetached: () => void,
  ) {
    super();
  }

  public override open(config: NdwuPopoverConfig): void {
    const isMobile = this.breakpointObserver.isMatched(HANDSET_BREAKPOINT);

    this.overlayRef = isMobile
      ? this.createMobileOverlay(config)
      : this.createDesktopOverlay(config);

    this.attachPortal(config, this.injector);

    const themeClass = detectThemeClass(this.elementRef.nativeElement);

    applyThemeClass(this.overlayRef.overlayElement, themeClass);

    afterNextRender(
      () => {
        if (!this.overlayRef?.overlayElement?.isConnected) {
          return;
        }

        if (!isMobile) {
          this.lockOverscroll();
          this.scrollUnregister = registerOverlayScroll(this.overlayRef) ?? null;
        }

        const disableOriginClickClose = config.closeOnOriginClick === false;

        if (disableOriginClickClose) {
          this.registerOutsideClickClose();
        } else {
          this.registerOriginClickClose();
        }
      },
      {injector: this.injector},
    );
  }

  public override close(options?: {focusOrigin?: boolean}): void {
    if (this.overlayRef === null) {
      return;
    }

    const shouldFocusOrigin = options?.focusOrigin !== false;

    this.dispose();

    if (shouldFocusOrigin) {
      this.elementRef.nativeElement.focus();
    }
  }

  public override dispose(): void {
    this.unregisterListeners();
    this.overlayRef?.dispose();
    this.virtualOriginElement?.remove();
    this.virtualOriginElement = null;
    this.isOriginPointMode = false;
    this.overlayRef = null;
  }

  public override getOverlayElement(): HTMLElement | null {
    return this.overlayRef?.overlayElement ?? null;
  }

  protected unregisterListeners(): void {
    this.unlockOverscroll();
    this.scrollUnregister?.();
    this.unregisterPositionChanges();
    this.unregisterOriginClickClose();
    this.unregisterOutsideClickClose();
  }

  protected createMobileOverlay(config: NdwuPopoverConfig): OverlayRef {
    const positionStrategy = this.overlay.position()
      .global()
      .bottom();

    const scrollStrategy = new MobileScrollLockStrategy();
    const panelClass = normalizeClass(config.panelClass, DEFAULT_PANEL_CLASS);

    const overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy,
      hasBackdrop: true,
      backdropClass: [BACKDROP_BASE_CLASS, `${BACKDROP_BASE_CLASS}--sheet`, 'cdk-overlay-backdrop-noop-animation'],
      panelClass,
      width: '100%',
    });

    overlayRef.detachments()
      .subscribe(() => this.handleOverlayDetached());

    overlayRef.backdropClick()
      .subscribe(() => this.close());

    overlayRef.keydownEvents()
      .subscribe((event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          this.close();
        }
      });

    return overlayRef;
  }

  /**
   * Returns the position origin for the overlay: trigger element (for element-origin dropdowns).
   * When config.originPoint is set, use point origin in createDesktopOverlay instead.
   */
  protected getPositionOrigin(): ElementRef<HTMLElement> {
    return this.elementRef;
  }

  protected buildDesktopPositionStrategy(config: NdwuPopoverConfig): {
    positionStrategy: ReturnType<ReturnType<Overlay['position']>['flexibleConnectedTo']>;
    rect: {top: number; bottom: number; left: number; right: number};
  } {
    const belowPosition = {
      originX: 'start' as const,
      originY: 'bottom' as const,
      overlayX: 'start' as const,
      overlayY: 'top' as const,
      offsetY: OFFSET_DROPDOWN,
    };

    const abovePosition = {
      originX: 'start' as const,
      originY: 'top' as const,
      overlayX: 'start' as const,
      overlayY: 'bottom' as const,
      offsetY: OFFSET_DROPUP,
    };

    /* eslint-disable id-denylist -- CDK flexibleConnectedTo point origin API uses x/y */
    const origin = config.originPoint
      ? {x: config.originPoint.clientX, y: config.originPoint.clientY}
      : this.getPositionOrigin();

    const rect = config.originPoint
      ? {
        top: config.originPoint.clientY,
        left: config.originPoint.clientX,
        bottom: config.originPoint.clientY,
        right: config.originPoint.clientX,
      }
      : this.elementRef.nativeElement.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - VIEWPORT_MARGIN;

    const positions = spaceBelow >= FULL_PANEL_HEIGHT
      ? [belowPosition, abovePosition]
      : spaceAbove >= FULL_PANEL_HEIGHT
      ? [abovePosition, belowPosition]
      : [belowPosition, abovePosition];

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(positions)
      .withViewportMargin(VIEWPORT_MARGIN)
      .withPush(false);

    return {positionStrategy, rect};
  }

  protected createDesktopOverlay(config: NdwuPopoverConfig): OverlayRef {
    this.isOriginPointMode = !!config.originPoint;

    const {positionStrategy, rect} = this.buildDesktopPositionStrategy(config);

    this.lastOriginRect = {top: rect.top, bottom: rect.bottom};

    const scrollStrategy = this.overlay.scrollStrategies.reposition();
    const originWidth = config.originPoint
      ? 0
      : this.elementRef.nativeElement.offsetWidth;

    const panelClass = normalizeClass(config.panelClass, DEFAULT_PANEL_CLASS);
    const noBackdrop = config.closeOnOriginClick === false;

    const overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy,
      panelClass,
      hasBackdrop: !noBackdrop,
      ...(noBackdrop ? {} : {backdropClass: BACKDROP_BASE_CLASS}),
    });

    overlayRef.updateSize({
      minWidth: Math.max(originWidth, config.minWidth ?? originWidth),
    });

    this.positionChangesSubscription = positionStrategy.positionChanges.subscribe(
      (change: ConnectedOverlayPositionChange) => {
        this.applyDesktopOverlayMaxHeight(overlayRef, change);
      },
    );

    this.attachDesktopOverlayListeners(overlayRef, noBackdrop);

    return overlayRef;
  }

  protected attachDesktopOverlayListeners(overlayRef: OverlayRef, noBackdrop: boolean): void {
    overlayRef.detachments()
      .subscribe(() => this.handleOverlayDetached());

    if (!noBackdrop) {
      overlayRef.backdropClick()
        .subscribe(() => this.close());
    }

    overlayRef.keydownEvents()
      .subscribe((event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          this.close();
        }
      });
  }

  protected applyDesktopOverlayMaxHeight(
    overlayRef: OverlayRef,
    change: ConnectedOverlayPositionChange,
  ): void {
    const pair = change.connectionPair;
    const rect = this.lastOriginRect ?? this.elementRef.nativeElement.getBoundingClientRect();
    const isBelow = pair.originY === 'bottom' && pair.overlayY === 'top';
    const availableHeight = isBelow
      ? window.innerHeight - rect.bottom - VIEWPORT_MARGIN
      : rect.top - VIEWPORT_MARGIN;

    const maxHeight = Math.max(MIN_PANEL_HEIGHT, availableHeight);

    overlayRef.updateSize({maxHeight});

    overlayRef.overlayElement.classList.toggle(ABOVE_PANEL_CLASS, !isBelow);
  }

  protected handleOverlayDetached(): void {
    this.unregisterListeners();

    this.lastOriginRect = null;
    this.virtualOriginElement?.remove();
    this.virtualOriginElement = null;
    this.isOriginPointMode = false;
    this.overlayRef = null;

    this.onOverlayDetached();
  }

  protected unregisterPositionChanges(): void {
    this.positionChangesSubscription?.unsubscribe();
    this.positionChangesSubscription = null;
  }

  protected registerOriginClickClose(): void {
    if (!this.overlayRef?.overlayElement?.isConnected) {
      return;
    }

    const origin = this.elementRef.nativeElement;
    const pane = this.overlayRef.overlayElement;

    const handler = (event: MouseEvent): void => {
      const target = event.target as Node;

      if (!origin.contains(target)) {
        return;
      }

      if (pane.contains(target)) {
        return;
      }

      event.stopImmediatePropagation();
      event.preventDefault();
      this.close();
    };

    document.addEventListener('click', handler, true);

    this.originClickUnregister = () => {
      document.removeEventListener('click', handler, true);
      this.originClickUnregister = null;
    };
  }

  protected unregisterOriginClickClose(): void {
    this.originClickUnregister?.();
  }

  protected registerOutsideClickClose(): void {
    if (!this.overlayRef?.overlayElement?.isConnected) {
      return;
    }

    const origin = this.elementRef.nativeElement;
    const pane = this.overlayRef.overlayElement;
    const isCursorOrigin = this.isOriginPointMode;

    const handler = (event: MouseEvent): void => {
      const target = event.target as Node;

      if (pane.contains(target)) {
        return;
      }

      if (!isCursorOrigin && origin.contains(target)) {
        return;
      }

      this.close();
    };

    const eventTypes = ['click', 'pointerdown', 'contextmenu'] as const;

    for (const eventType of eventTypes) {
      document.addEventListener(eventType, handler as EventListener, true);
    }

    this.outsideClickUnregister = () => {
      for (const eventType of eventTypes) {
        document.removeEventListener(eventType, handler as EventListener, true);
      }

      this.outsideClickUnregister = null;
    };
  }

  protected unregisterOutsideClickClose(): void {
    this.outsideClickUnregister?.();
  }

  /*
   * Suppress elastic overscroll on document while a dropdown is open
   * to prevent panel positioning lag
   */
  protected lockOverscroll(): void {
    const html = document.documentElement;

    this.savedOverscrollBehavior = html.style.overscrollBehavior;
    html.style.overscrollBehavior = 'none';
  }

  protected unlockOverscroll(): void {
    document.documentElement.style.overscrollBehavior = this.savedOverscrollBehavior;
  }
}

export function ndwuCreateDropdownController(
  elementRef: ElementRef<HTMLElement>,
  injector: Injector,
  onDetached: () => void,
): NdwuDropdownController {
  const overlay = injector.get(Overlay);
  const breakpointObserver = injector.get(BreakpointObserver);

  return new NdwuDropdownController(
    overlay,
    breakpointObserver,
    elementRef,
    injector,
    onDetached,
  );
}

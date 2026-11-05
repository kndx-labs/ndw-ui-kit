import {ElementRef, Injector} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {type ConnectedOverlayPositionChange, Overlay, type OverlayRef} from '@angular/cdk/overlay';
import {NdwuPopoverController} from '../../ndwu-popover-controller';
import type {NdwuPopoverSessionRef} from '../../ndwu-popover-session';
import type {NdwuPopoverConfig} from '../../ndwu-popover.types';
import {MobileScrollLockStrategy} from '../../mobile-scroll-lock.strategy';
import {HANDSET_BREAKPOINT, applyThemeClass, detectThemeClass, normalizeClass} from '@ndw-ui-kit/core/utils';

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
  public override readonly dismissesOnOutsideClick = true;

  constructor(
    protected readonly overlay: Overlay,
    protected readonly breakpointObserver: BreakpointObserver,
    protected readonly elementRef: ElementRef<HTMLElement>,
    protected readonly injector: Injector,
  ) {
    super();
  }

  public override open(config: NdwuPopoverConfig, session: NdwuPopoverSessionRef): void {
    const isMobile = this.breakpointObserver.isMatched(HANDSET_BREAKPOINT);

    const overlayRef = isMobile
      ? this.createMobileOverlay(config)
      : this.createDesktopOverlay(config);

    this.connectSession(overlayRef, session);
    this.attachPortal(overlayRef, config, this.injector);

    if (!session.isActive) {
      return;
    }

    applyThemeClass(overlayRef.overlayElement, detectThemeClass(this.elementRef.nativeElement));

    session.afterNextRender(() => this.registerDeferredListeners(overlayRef, config, session, isMobile));
  }

  protected createMobileOverlay(config: NdwuPopoverConfig): OverlayRef {
    const positionStrategy = this.overlay.position()
      .global()
      .bottom();

    return this.overlay.create({
      positionStrategy,
      scrollStrategy: new MobileScrollLockStrategy(),
      hasBackdrop: true,
      backdropClass: [BACKDROP_BASE_CLASS, `${BACKDROP_BASE_CLASS}--sheet`, 'cdk-overlay-backdrop-noop-animation'],
      panelClass: normalizeClass(config.panelClass, DEFAULT_PANEL_CLASS),
      width: '100%',
    });
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
    const {positionStrategy, rect} = this.buildDesktopPositionStrategy(config);
    const originWidth = config.originPoint
      ? 0
      : this.elementRef.nativeElement.offsetWidth;

    const noBackdrop = config.closeOnOriginClick === false;

    const overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: normalizeClass(config.panelClass, DEFAULT_PANEL_CLASS),
      hasBackdrop: !noBackdrop,
      ...(noBackdrop ? {} : {backdropClass: BACKDROP_BASE_CLASS}),
    });

    overlayRef.updateSize({
      minWidth: Math.max(originWidth, config.minWidth ?? originWidth),
    });

    positionStrategy.positionChanges.subscribe(
      (change: ConnectedOverlayPositionChange) => this.applyDesktopOverlayMaxHeight(overlayRef, change, rect),
    );

    return overlayRef;
  }

  protected registerDeferredListeners(
    overlayRef: OverlayRef,
    config: NdwuPopoverConfig,
    session: NdwuPopoverSessionRef,
    isMobile: boolean,
  ): void {
    if (!overlayRef.overlayElement.isConnected) {
      return;
    }

    if (!isMobile) {
      this.lockOverscroll(session);
      this.listenScroll(overlayRef, session);
    }

    if (config.closeOnOriginClick === false) {
      this.listenOutside(overlayRef, session, config.originPoint ? null : this.elementRef.nativeElement);
    } else {
      this.registerOriginClickClose(overlayRef, session);
    }
  }

  protected applyDesktopOverlayMaxHeight(
    overlayRef: OverlayRef,
    change: ConnectedOverlayPositionChange,
    rect: {top: number; bottom: number},
  ): void {
    const pair = change.connectionPair;
    const isBelow = pair.originY === 'bottom' && pair.overlayY === 'top';
    const availableHeight = isBelow
      ? window.innerHeight - rect.bottom - VIEWPORT_MARGIN
      : rect.top - VIEWPORT_MARGIN;

    const maxHeight = Math.max(MIN_PANEL_HEIGHT, availableHeight);

    overlayRef.updateSize({maxHeight});

    overlayRef.overlayElement.classList.toggle(ABOVE_PANEL_CLASS, !isBelow);
  }

  protected registerOriginClickClose(overlayRef: OverlayRef, session: NdwuPopoverSessionRef): void {
    const origin = this.elementRef.nativeElement;
    const pane = overlayRef.overlayElement;

    const handler = (event: MouseEvent): void => {
      const target = event.target;

      if (!(target instanceof Node) || !origin.contains(target) || pane.contains(target)) {
        return;
      }

      event.stopImmediatePropagation();
      event.preventDefault();
      session.close('origin-click');
    };

    document.addEventListener('click', handler, true);
    session.onFinish(() => document.removeEventListener('click', handler, true));
  }

  /*
   * Suppress elastic overscroll on document while a dropdown is open
   * to prevent panel positioning lag
   */
  protected lockOverscroll(session: NdwuPopoverSessionRef): void {
    const html = document.documentElement;
    const saved = html.style.overscrollBehavior;

    html.style.overscrollBehavior = 'none';
    session.onFinish(() => {
      html.style.overscrollBehavior = saved;
    });
  }
}

export function ndwuCreateDropdownController(
  elementRef: ElementRef<HTMLElement>,
  injector: Injector,
): NdwuDropdownController {
  const overlay = injector.get(Overlay);
  const breakpointObserver = injector.get(BreakpointObserver);

  return new NdwuDropdownController(
    overlay,
    breakpointObserver,
    elementRef,
    injector,
  );
}

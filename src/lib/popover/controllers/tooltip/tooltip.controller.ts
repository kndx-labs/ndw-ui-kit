import {ElementRef, Injector} from '@angular/core';
import {
  type ConnectedPosition,
  type FlexibleConnectedPositionStrategy,
  type FlexibleConnectedPositionStrategyOrigin,
  Overlay,
  type OverlayRef,
} from '@angular/cdk/overlay';
import {BreakpointObserver} from '@angular/cdk/layout';
import {NdwuPopoverController} from '../../ndwu-popover-controller';
import type {NdwuPopoverSessionRef} from '../../ndwu-popover-session';
import {HANDSET_BREAKPOINT, applyThemeClass, detectThemeClass, normalizeClass} from '@ndw-ui-kit/core/utils';
import type {
  NdwuPopoverAlign,
  NdwuPopoverConfig,
  NdwuPopoverOrigin,
  NdwuPopoverSide,
  NdwuTooltipPosition,
} from '../../ndwu-popover.types';
import {VIEWPORT_MARGIN, buildConnectedPosition, resolveConnectedOrigin, toConnectedOrigin} from '../../overlay-utils';
import {getScrollPaddingRootMargin} from './tooltip-root-margin';

const MOBILE_VIEWPORT_MARGIN = 16;

const SIDE_ORDER: Record<NdwuTooltipPosition, NdwuPopoverSide[]> = {
  above: ['top', 'bottom', 'left', 'right'],
  below: ['bottom', 'top', 'left', 'right'],
  left: ['left', 'right', 'bottom', 'top'],
  right: ['right', 'left', 'bottom', 'top'],
  auto: ['bottom', 'top', 'right', 'left'],
};

function buildPositions(preferred: NdwuTooltipPosition, align: NdwuPopoverAlign): ConnectedPosition[] {
  const sides = SIDE_ORDER[preferred];
  const positions = sides.map((side) => buildConnectedPosition(side, align));

  if (align === 'center') {
    return positions;
  }

  return [...positions, ...sides.map((side) => buildConnectedPosition(side, 'center'))];
}

/** The element behind a connected origin, or null for a viewport point. */
function originToElement(origin: FlexibleConnectedPositionStrategyOrigin): Element | null {
  if (origin instanceof ElementRef) {
    return origin.nativeElement instanceof Element ? origin.nativeElement : null;
  }

  return origin instanceof Element ? origin : null;
}

/**
 * Lightweight overlay controller for tooltips. Uses flexibleConnectedTo with preferred positions.
 * No backdrop, no mobile bottom-sheet — tooltips always float near the trigger.
 *
 * The overlay can be anchored to an external origin (`originElement`/`originPoint` in the config)
 * and re-anchored while open via `setOrigin()`, so one trigger can serve many targets. It closes,
 * without moving focus, once its origin element, having been in view, is fully out of view. Closing
 * works like Escape: the tooltip does not reopen when the origin returns.
 */
export class NdwuTooltipController extends NdwuPopoverController {
  protected readonly breakpointObserver: BreakpointObserver;

  private positionStrategy: FlexibleConnectedPositionStrategy | null = null;
  private visibilityObserver: IntersectionObserver | null = null;
  private visibilityTarget: Element | null = null;
  private visibilityTargetSeen = false;

  constructor(
    protected readonly overlay: Overlay,
    protected readonly elementRef: ElementRef<HTMLElement>,
    protected readonly injector: Injector,
    breakpointObserver?: BreakpointObserver,
  ) {
    super();

    this.breakpointObserver = breakpointObserver ?? injector.get(BreakpointObserver);
  }

  public override open(config: NdwuPopoverConfig, session: NdwuPopoverSessionRef): void {
    const {overlayRef, positionStrategy} = this.createOverlay(config);

    this.connectSession(overlayRef, session);
    this.positionStrategy = positionStrategy;
    session.onFinish(() => {
      if (this.positionStrategy === positionStrategy) {
        this.positionStrategy = null;
      }
    });

    this.attachPortal(overlayRef, config, this.injector);

    if (!session.isActive) {
      return;
    }

    applyThemeClass(overlayRef.overlayElement, detectThemeClass(this.elementRef.nativeElement));
    this.listenScroll(overlayRef, session);
    this.observeOverlayResize(overlayRef, session);
    this.observeOriginVisibility(resolveConnectedOrigin(config, this.elementRef), session);
  }

  public override setOrigin(origin: NdwuPopoverOrigin): void {
    if (this.overlayRef === null || this.positionStrategy === null) {
      return;
    }

    const connectedOrigin = toConnectedOrigin(origin);

    this.positionStrategy.setOrigin(connectedOrigin);
    this.overlayRef.updatePosition();
    this.retargetVisibility(this.visibilityTargetForOrigin(connectedOrigin));
  }

  protected createOverlay(config: NdwuPopoverConfig): {
    overlayRef: OverlayRef;
    positionStrategy: FlexibleConnectedPositionStrategy;
  } {
    const tooltipPosition = config.controllerConfig?.['tooltipPosition'] as NdwuTooltipPosition | undefined;
    const tooltipAlign = config.controllerConfig?.['tooltipAlign'] as NdwuPopoverAlign | undefined;
    const viewportMargin = this.breakpointObserver.isMatched(HANDSET_BREAKPOINT)
      ? MOBILE_VIEWPORT_MARGIN
      : VIEWPORT_MARGIN;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(resolveConnectedOrigin(config, this.elementRef))
      .withPositions(buildPositions(tooltipPosition ?? 'auto', tooltipAlign ?? 'center'))
      .withViewportMargin(viewportMargin)
      .withFlexibleDimensions(false)
      .withPush(true);

    const scrollStrategy = this.overlay.scrollStrategies.reposition();
    const panelClass = normalizeClass(config.panelClass, 'ndwu-tooltip');

    const overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy,
      panelClass,
      hasBackdrop: false,
    });

    // Lets the component's max-width calc() reserve exactly the margin CDK is positioning against,
    // instead of a separate hardcoded value that has to be kept in sync by hand.
    overlayRef.overlayElement.style.setProperty('--ndwu-tooltip-viewport-margin', `${viewportMargin}px`);

    return {overlayRef, positionStrategy};
  }

  /**
   * The tooltip settles its own height after CDK has placed it — the multiline padding lands once
   * the component has measured itself, and a viewport resize can rewrap the text. Both leave the
   * position computed against a stale height, so reposition whenever the pane's box changes.
   * Safe from feedback: withFlexibleDimensions(false) means a reposition never resizes the pane.
   */
  private observeOverlayResize(overlayRef: OverlayRef, session: NdwuPopoverSessionRef): void {
    const pane = overlayRef.overlayElement;

    if (!pane) {
      return;
    }

    const observer = new ResizeObserver(() => overlayRef.updatePosition());

    observer.observe(pane);
    session.onFinish(() => observer.disconnect());
  }

  /**
   * `withPush(true)` keeps the pane in view after its origin scrolls away, leaving it over unrelated
   * content. The default root also detects clipping by scroll containers without `cdkScrollable`.
   * An origin that has not been in view yet keeps the tooltip open, for example while a smooth scroll
   * brings it in. The observed viewport is reduced by root scroller `scroll-padding`, the usual place
   * to declare a fixed header's or footer's size; an origin covered there counts as out of view. Other
   * covering elements, including sticky headers inside nested scroll containers, are not detected. A
   * point origin is tracked through the trigger host.
   */
  private observeOriginVisibility(
    origin: FlexibleConnectedPositionStrategyOrigin,
    session: NdwuPopoverSessionRef,
  ): void {
    const observer = new IntersectionObserver((entries) => {
      // Entries queued before re-anchoring may arrive after the observer switches targets.
      for (const entry of entries) {
        if (entry.target !== this.visibilityTarget) {
          continue;
        }

        if (entry.isIntersecting) {
          this.visibilityTargetSeen = true;
        } else if (this.visibilityTargetSeen) {
          session.close('origin-hidden');

          return;
        }
      }
    }, {rootMargin: getScrollPaddingRootMargin()});

    this.visibilityObserver = observer;
    this.visibilityTarget = null;
    this.visibilityTargetSeen = false;
    this.retargetVisibility(this.visibilityTargetForOrigin(origin));

    session.onFinish(() => {
      observer.disconnect();

      if (this.visibilityObserver === observer) {
        this.visibilityObserver = null;
        this.visibilityTarget = null;
        this.visibilityTargetSeen = false;
      }
    });
  }

  /** Retargeting the same element keeps its seen state. */
  private retargetVisibility(target: Element): void {
    if (this.visibilityObserver === null) {
      return;
    }

    if (target === this.visibilityTarget) {
      return;
    }

    if (this.visibilityTarget !== null) {
      this.visibilityObserver.unobserve(this.visibilityTarget);
    }

    this.visibilityTargetSeen = false;
    this.visibilityTarget = target;
    this.visibilityObserver.observe(target);
  }

  /** A viewport point stays fixed while content scrolls under it, so observe the trigger host instead. */
  private visibilityTargetForOrigin(origin: FlexibleConnectedPositionStrategyOrigin): Element {
    const originElement = originToElement(origin);

    if (originElement !== null) {
      return originElement;
    }

    return this.elementRef.nativeElement;
  }
}

export function ndwuCreateTooltipController(
  elementRef: ElementRef<HTMLElement>,
  injector: Injector,
): NdwuTooltipController {
  const overlay = injector.get(Overlay);

  return new NdwuTooltipController(overlay, elementRef, injector);
}

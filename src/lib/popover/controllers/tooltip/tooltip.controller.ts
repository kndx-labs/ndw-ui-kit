import {ElementRef, Injector} from '@angular/core';
import {
  type ConnectedPosition,
  type FlexibleConnectedPositionStrategy,
  Overlay,
  type OverlayRef,
} from '@angular/cdk/overlay';
import {BreakpointObserver} from '@angular/cdk/layout';
import {NdwuPopoverController} from '../../ndwu-popover-controller';
import {HANDSET_BREAKPOINT, applyThemeClass, detectThemeClass, normalizeClass} from '@ndw-ui-kit/core/utils';
import type {
  NdwuPopoverAlign,
  NdwuPopoverConfig,
  NdwuPopoverOrigin,
  NdwuPopoverSide,
  NdwuTooltipPosition,
} from '../../ndwu-popover.types';
import {
  VIEWPORT_MARGIN,
  buildConnectedPosition,
  registerOverlayScroll,
  resolveConnectedOrigin,
  toConnectedOrigin,
} from '../../overlay-utils';

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

/**
 * Lightweight overlay controller for tooltips. Uses flexibleConnectedTo with preferred positions.
 * No backdrop, no mobile bottom-sheet — tooltips always float near the trigger.
 *
 * The overlay can be anchored to an external origin (`originElement`/`originPoint` in the config)
 * and re-anchored while open via `setOrigin()`, so one trigger can serve many targets.
 * `controllerConfig.restoreFocus: false` stops `close()` and Escape from focusing the trigger.
 */
export class NdwuTooltipController extends NdwuPopoverController {
  protected readonly breakpointObserver: BreakpointObserver;

  private resizeObserver: ResizeObserver | null = null;
  private positionStrategy: FlexibleConnectedPositionStrategy | null = null;
  private restoreFocus = true;

  constructor(
    protected readonly overlay: Overlay,
    protected readonly elementRef: ElementRef<HTMLElement>,
    protected readonly injector: Injector,
    protected readonly onOverlayDetached: () => void,
    breakpointObserver?: BreakpointObserver,
  ) {
    super();

    this.breakpointObserver = breakpointObserver ?? injector.get(BreakpointObserver);
  }

  public override open(config: NdwuPopoverConfig): void {
    this.restoreFocus = config.controllerConfig?.['restoreFocus'] !== false;
    this.overlayRef = this.createOverlay(config);

    this.attachPortal(config, this.injector);

    applyThemeClass(
      this.overlayRef.overlayElement,
      detectThemeClass(this.elementRef.nativeElement),
    );

    this.overlayRef.detachments()
      .subscribe(() => this.handleOverlayDetached());

    this.overlayRef.keydownEvents()
      .subscribe((event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          this.close();
        }
      });

    this.scrollUnregister = registerOverlayScroll(this.overlayRef);
    this.observeOverlayResize(this.overlayRef);
  }

  public override close(options?: {focusOrigin?: boolean}): void {
    if (this.overlayRef === null) {
      return;
    }

    this.dispose();

    if (options?.focusOrigin !== false && this.restoreFocus) {
      this.elementRef.nativeElement.focus();
    }
  }

  public override dispose(): void {
    this.scrollUnregister?.();
    this.disconnectResizeObserver();
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.positionStrategy = null;
  }

  public override setOrigin(origin: NdwuPopoverOrigin): void {
    if (this.overlayRef === null || this.positionStrategy === null) {
      return;
    }

    this.positionStrategy.setOrigin(toConnectedOrigin(origin));
    this.overlayRef.updatePosition();
  }

  public override getOverlayElement(): HTMLElement | null {
    return this.overlayRef?.overlayElement ?? null;
  }

  protected createOverlay(config: NdwuPopoverConfig): OverlayRef {
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

    this.positionStrategy = positionStrategy;

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

    return overlayRef;
  }

  protected handleOverlayDetached(): void {
    this.scrollUnregister?.();
    this.disconnectResizeObserver();
    this.overlayRef = null;
    this.positionStrategy = null;
    this.onOverlayDetached();
  }

  /**
   * The tooltip settles its own height after CDK has placed it — the multiline padding lands once
   * the component has measured itself, and a viewport resize can rewrap the text. Both leave the
   * position computed against a stale height, so reposition whenever the pane's box changes.
   * Safe from feedback: withFlexibleDimensions(false) means a reposition never resizes the pane.
   */
  private observeOverlayResize(overlayRef: OverlayRef): void {
    const pane = overlayRef.overlayElement;

    if (!pane) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.overlayRef?.updatePosition());
    this.resizeObserver.observe(pane);
  }

  private disconnectResizeObserver(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }
}

export function ndwuCreateTooltipController(
  elementRef: ElementRef<HTMLElement>,
  injector: Injector,
  onDetached: () => void,
): NdwuTooltipController {
  const overlay = injector.get(Overlay);

  return new NdwuTooltipController(overlay, elementRef, injector, onDetached);
}

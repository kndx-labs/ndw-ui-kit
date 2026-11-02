import {ElementRef, Injector} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {Overlay, type OverlayRef} from '@angular/cdk/overlay';
import {NdwuPopoverController} from '../../ndwu-popover-controller';
import type {NdwuPopoverSessionRef} from '../../ndwu-popover-session';
import type {NdwuPopoverAlign, NdwuPopoverConfig, NdwuPopoverSide} from '../../ndwu-popover.types';
import {HANDSET_BREAKPOINT, applyThemeClass, detectThemeClass, normalizeClass} from '@ndw-ui-kit/core/utils';
import {MobileScrollLockStrategy} from '../../mobile-scroll-lock.strategy';
import {VIEWPORT_MARGIN, registerOverlayScroll} from '../../overlay-utils';
import {buildPopoverPositions} from './popover-panel.helpers';

const DEFAULT_PANEL_CLASS = 'ndwu-popover-panel';
const MOBILE_BACKDROP_CLASS = 'ndwu-popover-backdrop--sheet';
const DEFAULT_POPOVER_SIDE: NdwuPopoverSide = 'bottom';
const DEFAULT_POPOVER_ALIGN: NdwuPopoverAlign = 'center';

export class NdwuPopoverPanelController extends NdwuPopoverController {
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

    this.trackOverlay(overlayRef, session);
    this.listenEscape(overlayRef, session);

    overlayRef.backdropClick()
      .subscribe(() => session.close('outside'));

    this.attachPortal(config, this.injector);

    if (!session.isActive()) {
      return;
    }

    applyThemeClass(overlayRef.overlayElement, detectThemeClass(this.elementRef.nativeElement));

    if (!isMobile) {
      this.registerOutsideClickClose(overlayRef, session);

      const unregisterScroll = registerOverlayScroll(overlayRef);

      if (unregisterScroll) {
        session.onFinish(unregisterScroll);
      }
    }
  }

  protected createDesktopOverlay(config: NdwuPopoverConfig): OverlayRef {
    const popoverSide = (config.controllerConfig?.['popoverSide'] ?? DEFAULT_POPOVER_SIDE) as NdwuPopoverSide;
    const popoverAlign = (config.controllerConfig?.['popoverAlign'] ?? DEFAULT_POPOVER_ALIGN) as NdwuPopoverAlign;
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(buildPopoverPositions(popoverSide, popoverAlign))
      .withViewportMargin(VIEWPORT_MARGIN)
      .withPush(false);

    const scrollStrategy = this.overlay.scrollStrategies.reposition();
    const panelClass = normalizeClass(config.panelClass, DEFAULT_PANEL_CLASS);

    return this.overlay.create({
      positionStrategy,
      scrollStrategy,
      panelClass,
      hasBackdrop: false,
    });
  }

  protected createMobileOverlay(config: NdwuPopoverConfig): OverlayRef {
    // @dprint-ignore
    const positionStrategy = this.overlay.position().global()
.bottom();
    const scrollStrategy = new MobileScrollLockStrategy();
    const panelClass = normalizeClass(config.panelClass, DEFAULT_PANEL_CLASS);

    return this.overlay.create({
      positionStrategy,
      scrollStrategy,
      panelClass,
      hasBackdrop: true,
      backdropClass: [MOBILE_BACKDROP_CLASS, 'cdk-overlay-backdrop-noop-animation'],
      width: '100%',
    });
  }

  protected registerOutsideClickClose(overlayRef: OverlayRef, session: NdwuPopoverSessionRef): void {
    const origin = this.elementRef.nativeElement;
    const pane = overlayRef.overlayElement;

    if (!pane?.isConnected) {
      return;
    }

    const handler = (event: Event): void => {
      const target = event.target as Node;

      if (pane.contains(target) || origin.contains(target)) {
        return;
      }

      session.close('outside');
    };

    const eventTypes = ['click', 'pointerdown'] as const;

    for (const eventType of eventTypes) {
      document.addEventListener(eventType, handler, true);
    }

    session.onFinish(() => {
      for (const eventType of eventTypes) {
        document.removeEventListener(eventType, handler, true);
      }
    });
  }
}

export function ndwuCreatePopoverController(
  elementRef: ElementRef<HTMLElement>,
  injector: Injector,
): NdwuPopoverPanelController {
  const overlay = injector.get(Overlay);
  const breakpointObserver = injector.get(BreakpointObserver);

  return new NdwuPopoverPanelController(
    overlay,
    breakpointObserver,
    elementRef,
    injector,
  );
}

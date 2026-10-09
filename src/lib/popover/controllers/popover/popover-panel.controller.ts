import {ElementRef, Injector} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {Overlay, type OverlayRef} from '@angular/cdk/overlay';
import {NdwuPopoverController} from '../../ndwu-popover-controller';
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

    applyThemeClass(
      this.overlayRef.overlayElement,
      detectThemeClass(this.elementRef.nativeElement),
    );

    this.overlayRef.detachments()
      .subscribe(() => this.handleOverlayDetached());

    this.overlayRef.backdropClick()
      .subscribe(() => this.close());

    this.overlayRef.keydownEvents()
      .subscribe((event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          this.close();
        }
      });

    if (!isMobile) {
      this.registerOutsideClickClose();
      this.scrollUnregister = registerOverlayScroll(this.overlayRef);
    }
  }

  public override close(options?: {focusOrigin?: boolean}): void {
    if (this.overlayRef === null) {
      return;
    }

    this.dispose();

    if (options?.focusOrigin !== false) {
      this.elementRef.nativeElement.focus();
    }
  }

  public override dispose(): void {
    this.scrollUnregister?.();
    this.outsideClickUnregister?.();
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  public override getOverlayElement(): HTMLElement | null {
    return this.overlayRef?.overlayElement ?? null;
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

  protected handleOverlayDetached(): void {
    this.scrollUnregister?.();
    this.outsideClickUnregister?.();
    this.overlayRef = null;
    this.onOverlayDetached();
  }

  protected registerOutsideClickClose(): void {
    if (!this.overlayRef?.overlayElement?.isConnected) {
      return;
    }

    const origin = this.elementRef.nativeElement;
    const pane = this.overlayRef.overlayElement;

    const handler = (event: MouseEvent): void => {
      const target = event.target as Node;

      if (pane.contains(target) || origin.contains(target)) {
        return;
      }

      this.close();
    };

    for (const eventType of ['click', 'pointerdown'] as const) {
      document.addEventListener(eventType, handler as EventListener, true);
    }

    this.outsideClickUnregister = () => {
      for (const eventType of ['click', 'pointerdown'] as const) {
        document.removeEventListener(eventType, handler as EventListener, true);
      }

      this.outsideClickUnregister = null;
    };
  }
}

export function createPopoverController(
  elementRef: ElementRef<HTMLElement>,
  injector: Injector,
  onDetached: () => void,
): NdwuPopoverPanelController {
  const overlay = injector.get(Overlay);
  const breakpointObserver = injector.get(BreakpointObserver);

  return new NdwuPopoverPanelController(
    overlay,
    breakpointObserver,
    elementRef,
    injector,
    onDetached,
  );
}

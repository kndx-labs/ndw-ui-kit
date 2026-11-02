import {ElementRef, InjectionToken, Injector, type Provider, TemplateRef, signal} from '@angular/core';
import type {OverlayRef} from '@angular/cdk/overlay';
import type {NdwuPopoverConfig, NdwuPopoverOrigin} from './ndwu-popover.types';
import type {NdwuPopoverSessionRef} from './ndwu-popover-session';
import {NDWU_POPOVER_CONTENT, NDWU_POPOVER_CONTEXT, NDWU_POPOVER_TRAP_FOCUS} from './ndwu-popover.tokens';
import {ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {NdwuPopoverHostComponent} from './ndwu-popover-host.component';
import {registerOutsideDismiss, registerOverlayScroll} from './overlay-utils';

export abstract class NdwuPopoverController {
  public readonly dismissesOnOutsideClick: boolean = false;

  protected overlayRef: OverlayRef | null = null;

  public abstract open(config: NdwuPopoverConfig, session: NdwuPopoverSessionRef): void;

  /** Returns the CDK overlay pane element of the current open, or null. */
  public getOverlayElement(): HTMLElement | null {
    return this.overlayRef?.overlayElement ?? null;
  }

  /**
   * Re-anchors the open overlay to another origin and recomputes its position without closing it.
   * No-op by default; controllers that support re-anchoring (tooltip) override it.
   */
  public setOrigin(_origin: NdwuPopoverOrigin): void {}

  protected connectSession(overlayRef: OverlayRef, session: NdwuPopoverSessionRef): void {
    this.trackOverlay(overlayRef, session);
    this.listenEscape(overlayRef, session);
    this.listenBackdrop(overlayRef, session);
  }

  protected trackOverlay(overlayRef: OverlayRef, session: NdwuPopoverSessionRef): void {
    this.overlayRef = overlayRef;

    session.onFinish(() => {
      overlayRef.dispose();

      if (this.overlayRef === overlayRef) {
        this.overlayRef = null;
      }
    });

    overlayRef.detachments()
      .subscribe(() => session.close('detached'));
  }

  protected listenEscape(overlayRef: OverlayRef, session: NdwuPopoverSessionRef): void {
    overlayRef.keydownEvents()
      .subscribe((event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          session.close('escape');
        }
      });
  }

  protected listenBackdrop(overlayRef: OverlayRef, session: NdwuPopoverSessionRef): void {
    if (overlayRef.getConfig().hasBackdrop) {
      overlayRef.backdropClick()
        .subscribe(() => session.close('outside'));
    }
  }

  protected listenOutside(overlayRef: OverlayRef, session: NdwuPopoverSessionRef, origin: Element | null): void {
    const pane = overlayRef.overlayElement;

    if (!pane.isConnected) {
      return;
    }

    registerOutsideDismiss(
      session,
      (target) => pane.contains(target) || (origin?.contains(target) ?? false),
      () => session.close('outside'),
    );
  }

  protected listenScroll(overlayRef: OverlayRef, session: NdwuPopoverSessionRef): void {
    const unregisterScroll = registerOverlayScroll(overlayRef);

    if (unregisterScroll) {
      session.onFinish(unregisterScroll);
    }
  }

  protected attachPortal(
    overlayRef: OverlayRef,
    config: NdwuPopoverConfig,
    injector: Injector,
  ): void {
    const contextSignal = signal(config.context);

    const trapFocus = config.trapFocus === true;
    const hostProviders: Provider[] = [
      {provide: NDWU_POPOVER_CONTENT, useValue: config.content},
      {provide: NDWU_POPOVER_CONTEXT, useValue: contextSignal},
      {provide: NDWU_POPOVER_TRAP_FOCUS, useValue: trapFocus},
      ...(config.providers ?? []),
    ];

    const portalInjector = Injector.create({
      parent: injector,
      providers: hostProviders,
    });

    // Level 1: Attach host container to overlay
    const hostPortal = new ComponentPortal(
      NdwuPopoverHostComponent,
      null,
      portalInjector,
    );

    const hostRef = overlayRef.attach(hostPortal);
    const content = config.content;

    // Level 2: Attach content into host's portal outlet
    if (typeof content === 'function') {
      const contentPortal = new ComponentPortal(content, null, portalInjector);

      hostRef.instance.attachComponentPortal(contentPortal);
    } else if (content instanceof TemplateRef) {
      const contentPortal = new TemplatePortal(
        content,
        hostRef.instance.viewContainerRef,
        config.context,
      );

      hostRef.instance.attachTemplatePortal(contentPortal);
    }
    // String content is rendered directly by NdwuPopoverHostComponent
  }
}

export type NdwuPopoverControllerFactory = (
  elementRef: ElementRef<HTMLElement>,
  injector: Injector,
) => NdwuPopoverController;

export const NDWU_POPOVER_CONTROLLER_FACTORY = new InjectionToken<NdwuPopoverControllerFactory>(
  'NDWU_POPOVER_CONTROLLER_FACTORY',
);

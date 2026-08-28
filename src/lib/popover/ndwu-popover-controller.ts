import {ElementRef, InjectionToken, Injector, type Provider, TemplateRef, signal} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import type {NdwuPopoverConfig} from './ndwu-popover.types';
import {NDWU_POPOVER_CONTENT, NDWU_POPOVER_CONTEXT, NDWU_POPOVER_TRAP_FOCUS} from './ndwu-popover.tokens';
import {ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {NdwuPopoverHostComponent} from './ndwu-popover-host.component';

export abstract class NdwuPopoverController {
  protected overlayRef: OverlayRef | null = null;
  protected scrollUnregister: (() => void) | null = null;
  protected originClickUnregister: (() => void) | null = null;
  protected outsideClickUnregister: (() => void) | null = null;

  public abstract open(config: NdwuPopoverConfig): void;
  public abstract close(options?: {focusOrigin?: boolean}): void;
  public abstract dispose(): void;

  /**
   * Returns the CDK overlay pane element, or null if not open.
   * Used by the trigger for hover bridging.
   */
  public abstract getOverlayElement(): HTMLElement | null;

  protected attachPortal(
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

    if (!this.overlayRef) {
      console.warn('[NdwuPopoverController]: "overlayRef" is null');

      return;
    }

    const hostRef = this.overlayRef.attach(hostPortal);
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
  onDetached: () => void,
) => NdwuPopoverController;

export const NDWU_POPOVER_CONTROLLER_FACTORY = new InjectionToken<NdwuPopoverControllerFactory>(
  'NDWU_POPOVER_CONTROLLER_FACTORY',
);

import {Injector, afterNextRender} from '@angular/core';
import type {NdwuPopoverTriggerType} from './ndwu-popover.types';

export interface NdwuPopoverInteractionCtx {
  isOpen: () => boolean;
  hasTriggerType: (type: NdwuPopoverTriggerType) => boolean;
  getOverlayElement: () => HTMLElement | null;
  getTriggerElement: () => HTMLElement;

  getShowDelay: () => number;
  show: () => void; // called when the scheduled show timer fires.

  getHideDelay: () => number;
  hide: () => void; // called when the scheduled hide timer fires.
}

/**
 * The `NdwuPopoverInteractionController` helper class encapsulates a few things
 * related to a popover. It is responsible for:
 * - Show/hide timer lifecycle.
 * - DOM event-listener registrations.
 *
 * The `injector` constructor argument must be the `NdwuPopoverTriggerDirective`'s
 * own `NodeInjector`. Do NOT pass an EnvironmentInjector — Angular ties
 * `afterNextRender` cleanup to the `DestroyRef` carried by the `NodeInjector`.
 */
export class NdwuPopoverInteractionController {
  protected showTimerId: ReturnType<typeof setTimeout> | null = null;
  protected hideTimerId: ReturnType<typeof setTimeout> | null = null;
  protected hoveredOverlay = false;
  protected hoverBridgeUnregister: (() => void) | null = null;
  protected outsideClickUnregister: (() => void) | null = null;

  constructor(
    protected readonly injector: Injector,
    protected readonly ctx: NdwuPopoverInteractionCtx,
  ) {}

  public scheduleShow(): void {
    this.clearHideTimer();

    const delay = this.ctx.getShowDelay();

    if (delay <= 0) {
      this.ctx.show();

      return;
    }

    this.showTimerId = setTimeout(
      () => {
        this.showTimerId = null;

        this.ctx.show();
      },
      delay,
    );
  }

  public scheduleHide(): void {
    this.clearShowTimer();

    const delay = this.ctx.getHideDelay();

    if (delay <= 0) {
      this.executeHide();

      return;
    }

    this.hideTimerId = setTimeout(
      () => {
        this.hideTimerId = null;

        this.executeHide();
      },
      delay,
    );
  }

  /**
   * Registers mouseenter/mouseleave listeners on the overlay pane so that
   * hovering into the overlay cancels the hide timer. Uses `afterNextRender`
   * because the overlay is not yet in the DOM at the time
   * `NdwuPopoverTriggerDirective.open()` is called.
   *
   * Uses a per-registration closure `active` flag (NOT a class-level boolean)
   * so that calling `dispose()` followed by `registerHoverBridge()` again
   * works correctly across multiple open/close cycles.
   */
  public registerHoverBridge(): void {
    // Per-registration cancellation guard. Reset on each new registration so
    // the controller is reusable across multiple open/close cycles.
    let active = true;

    // Store a cancel-only function immediately so dispose() can cancel even
    // before the afterNextRender callback fires.
    this.hoverBridgeUnregister = () => {
      active = false;
      this.hoverBridgeUnregister = null;
    };

    afterNextRender(
      () => {
        if (!active) {
          return;
        }

        const overlay = this.ctx.getOverlayElement();

        if (!overlay?.isConnected) {
          this.hoverBridgeUnregister = null;

          return;
        }

        const onOverlayEnter = (): void => {
          this.hoveredOverlay = true;

          this.clearHideTimer();
        };

        const onOverlayLeave = (): void => {
          this.hoveredOverlay = false;

          this.scheduleHide();
        };

        overlay.addEventListener('mouseenter', onOverlayEnter);
        overlay.addEventListener('mouseleave', onOverlayLeave);

        // Upgrade to full cleanup once listeners are attached.
        this.hoverBridgeUnregister = () => {
          active = false;

          overlay.removeEventListener('mouseenter', onOverlayEnter);
          overlay.removeEventListener('mouseleave', onOverlayLeave);

          this.hoverBridgeUnregister = null;
        };
      },
      {injector: this.injector},
    );
  }

  public registerOutsideClickClose(): void {
    this.outsideClickUnregister?.();

    const trigger: HTMLElement = this.ctx.getTriggerElement();

    const handler = (event: MouseEvent): void => {
      const target = event.target as Node;
      const pane = this.ctx.getOverlayElement();

      if (pane?.contains(target)) {
        return;
      }

      if (trigger.contains(target)) {
        return;
      }

      this.ctx.hide();
    };

    document.addEventListener('click', handler, true);

    this.outsideClickUnregister = () => {
      document.removeEventListener('click', handler, true);

      this.outsideClickUnregister = null;
    };
  }

  /**
   * Cancels pending timers, resets hoveredOverlay, and unregisters all DOM
   * listeners. Idempotent — safe to call multiple times.
   */
  public dispose(): void {
    this.clearShowTimer();
    this.clearHideTimer();

    this.hoveredOverlay = false;

    this.hoverBridgeUnregister?.();

    this.hoverBridgeUnregister = null;

    this.outsideClickUnregister?.();

    this.outsideClickUnregister = null;
  }

  protected executeHide(): void {
    if (!this.ctx.isOpen()) {
      return;
    }

    if (this.hoveredOverlay) {
      return;
    }

    if (this.ctx.hasTriggerType('focus')) {
      const trigger: HTMLElement = this.ctx.getTriggerElement();
      const overlay: HTMLElement | null = this.ctx.getOverlayElement();
      const active: Element | null = document.activeElement;

      if (active !== null && trigger.contains(active)) {
        return;
      }

      if (overlay !== null && active !== null && overlay.contains(active)) {
        return;
      }
    }

    this.ctx.hide();
  }

  protected clearShowTimer(): void {
    if (this.showTimerId !== null) {
      clearTimeout(this.showTimerId);

      this.showTimerId = null;
    }
  }

  protected clearHideTimer(): void {
    if (this.hideTimerId !== null) {
      clearTimeout(this.hideTimerId);

      this.hideTimerId = null;
    }
  }
}

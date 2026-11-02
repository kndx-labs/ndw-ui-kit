import type {NdwuPopoverSession} from './ndwu-popover-session';
import type {NdwuPopoverTriggerType} from './ndwu-popover.types';

export interface NdwuPopoverInteractionCtx {
  isOpen: () => boolean;
  hasTriggerType: (type: NdwuPopoverTriggerType) => boolean;
  getSession: () => NdwuPopoverSession | null;
  getOverlayElement: () => HTMLElement | null;
  getTriggerElement: () => HTMLElement;
  isOriginHovered: () => boolean;

  getShowDelay: () => number;
  show: (bridge: boolean) => void;

  getHideDelay: () => number;
  hide: () => void;
  dismissOutside: () => void;
}

export interface NdwuPopoverInteractionOptions {
  hoverBridge: boolean;
  outsideClick: boolean;
  focusout: boolean;
}

/**
 * The `NdwuPopoverInteractionController` helper class encapsulates a few things
 * related to a popover. It is responsible for:
 * - Show/hide timer lifecycle.
 * - DOM event-listener registrations.
 */
export class NdwuPopoverInteractionController {
  protected showTimerId: ReturnType<typeof setTimeout> | null = null;
  protected cancelHideTimer: (() => void) | null = null;
  protected hoveredOverlay = false;

  constructor(protected readonly ctx: NdwuPopoverInteractionCtx) {}

  public scheduleShow(bridge: boolean): void {
    this.cancelScheduledHide();
    this.cancelScheduledShow();

    if (this.ctx.isOpen()) {
      return;
    }

    const delay = this.ctx.getShowDelay();

    if (delay <= 0) {
      this.ctx.show(bridge);

      return;
    }

    this.showTimerId = setTimeout(
      () => {
        this.showTimerId = null;
        this.ctx.show(bridge);
      },
      delay,
    );
  }

  public scheduleHide(): void {
    this.cancelScheduledShow();
    this.cancelScheduledHide();

    const session = this.ctx.getSession();

    if (session === null) {
      return;
    }

    const delay = this.ctx.getHideDelay();

    if (delay <= 0) {
      this.executeHide();

      return;
    }

    this.cancelHideTimer = session.setTimeout(
      () => {
        this.cancelHideTimer = null;
        this.executeHide();
      },
      delay,
    );
  }

  public cancelScheduledShow(): void {
    if (this.showTimerId !== null) {
      clearTimeout(this.showTimerId);
      this.showTimerId = null;
    }
  }

  public cancelScheduledHide(): void {
    this.cancelHideTimer?.();
    this.cancelHideTimer = null;
  }

  public attach(session: NdwuPopoverSession, options: NdwuPopoverInteractionOptions): void {
    session.onFinish(() => {
      this.hoveredOverlay = false;
      this.cancelHideTimer = null;
    });

    if (options.outsideClick) {
      this.registerOutsideClickClose(session);
    }

    if (options.hoverBridge) {
      session.afterNextRender(() => this.registerHoverBridge(session));
    }

    if (options.focusout) {
      session.afterNextRender(() => this.registerFocusout(session));
    }
  }

  protected registerHoverBridge(session: NdwuPopoverSession): void {
    const overlay = this.ctx.getOverlayElement();

    if (!overlay?.isConnected) {
      return;
    }

    const onOverlayEnter = (): void => {
      this.hoveredOverlay = true;
      this.cancelScheduledHide();
    };

    const onOverlayLeave = (): void => {
      this.hoveredOverlay = false;
      this.scheduleHide();
    };

    overlay.addEventListener('mouseenter', onOverlayEnter);
    overlay.addEventListener('mouseleave', onOverlayLeave);
    session.onFinish(() => {
      overlay.removeEventListener('mouseenter', onOverlayEnter);
      overlay.removeEventListener('mouseleave', onOverlayLeave);
    });
  }

  protected registerFocusout(session: NdwuPopoverSession): void {
    const overlay = this.ctx.getOverlayElement();

    if (!overlay?.isConnected) {
      return;
    }

    const onFocusOut = (event: FocusEvent): void => {
      const next = event.relatedTarget as Node | null;

      if (next === null || overlay.contains(next) || this.ctx.getTriggerElement().contains(next)) {
        return;
      }

      this.scheduleHide();
    };

    overlay.addEventListener('focusout', onFocusOut);
    session.onFinish(() => overlay.removeEventListener('focusout', onFocusOut));
  }

  protected registerOutsideClickClose(session: NdwuPopoverSession): void {
    const trigger = this.ctx.getTriggerElement();

    const handler = (event: MouseEvent): void => {
      const target = event.target as Node;

      if (this.ctx.getOverlayElement()?.contains(target) || trigger.contains(target)) {
        return;
      }

      this.ctx.dismissOutside();
    };

    document.addEventListener('click', handler, true);
    session.onFinish(() => document.removeEventListener('click', handler, true));
  }

  protected executeHide(): void {
    if (!this.ctx.isOpen() || this.hoveredOverlay) {
      return;
    }

    if (this.ctx.hasTriggerType('hover') && this.ctx.isOriginHovered()) {
      return;
    }

    if (this.ctx.hasTriggerType('focus') && this.isFocusWithin()) {
      return;
    }

    this.ctx.hide();
  }

  protected isFocusWithin(): boolean {
    const focused = document.activeElement;

    if (focused === null) {
      return false;
    }

    return this.ctx.getTriggerElement().contains(focused)
      || (this.ctx.getOverlayElement()?.contains(focused) ?? false);
  }
}

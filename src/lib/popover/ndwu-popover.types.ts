import type {ElementRef, Provider, TemplateRef, Type} from '@angular/core';

export type NdwuPopoverTriggerType = 'click' | 'hover' | 'focus' | 'manual';

export type NdwuPopoverSide = 'top' | 'bottom' | 'left' | 'right';

export type NdwuPopoverAlign = 'start' | 'center' | 'end';

/** Content that can be rendered in a popover: component type, template, or string. */
export type NdwuDynamicContent<C = unknown> = Type<unknown> | TemplateRef<C> | string;

/** Viewport point (clientX/clientY) an overlay can be anchored to instead of an element. */
export interface NdwuPopoverOriginPoint {
  clientX: number;
  clientY: number;
}

/** `Element` rather than `HTMLElement`, so SVG shapes (e.g. chart cells) can be origins too. */
export type NdwuPopoverOriginElement = Element | ElementRef<Element>;

/** Anything an overlay can be anchored to: an element or a viewport point. */
export type NdwuPopoverOrigin = NdwuPopoverOriginElement | NdwuPopoverOriginPoint;

export interface NdwuPopoverConfig {
  /** Content to render in the overlay (component or template). */
  content: NdwuDynamicContent;
  /** Optional context for the content (wrapped in a signal for reactivity). */
  context?: unknown;
  /** DI providers for the overlay (options, callbacks, etc.). */
  providers?: Provider[];
  /** Panel CSS class(es). */
  panelClass?: string | string[];
  /** Optional min width for desktop floating (default 0). */
  minWidth?: number;
  /** When false, focus is not trapped in the overlay (e.g. for autocomplete). Default false. */
  trapFocus?: boolean;
  /** When true, clicking the origin element while the overlay is open closes it. Only applies to click trigger. Default true. */
  closeOnOriginClick?: boolean;
  /**
   * When set, overlay is positioned at this point (e.g. mouse cursor) instead of the trigger element.
   * Useful for context menus. Coordinates are in viewport (clientX/clientY).
   * Takes precedence over `originElement`. Read by the dropdown and tooltip controllers.
   */
  originPoint?: NdwuPopoverOriginPoint;
  /**
   * When set, overlay is positioned relative to this element instead of the trigger element
   * (e.g. the active cell of a widget that has one trigger for many cells).
   * Read by the tooltip controller.
   */
  originElement?: NdwuPopoverOriginElement;
  /** Opaque config bag passed through to the controller (e.g. tooltipPosition for tooltips). */
  controllerConfig?: Record<string, unknown>;
}

export type NdwuTooltipPosition = 'auto' | 'above' | 'below' | 'left' | 'right';

import {InjectionToken, type Signal} from '@angular/core';

/**
 * Contract that any form-field control must implement to integrate with `ndwu-form-field`.
 *
 * The form-field only knows about this interface + token (IoC), so any custom control can
 * plug in by providing `NDWU_CONTROL`.
 */
export interface NdwuControl {
  /** The id of the focusable element the label should point to. */
  readonly id: string;
  /** Whether the control is currently focused. */
  readonly focused: Signal<boolean>;
  /** Desired control width in CSS pixels, when the control manages one. */
  readonly preferredWidth?: Signal<number | null>;
  /** Whether the control is empty (used for floating-label behavior). */
  readonly empty: boolean;
  /** Whether the control is disabled. */
  readonly disabled: boolean;
  /** Whether the control is readonly. */
  readonly readonly?: Signal<boolean>;
  /**
   * Whether the control has a placeholder (e.g. select with an empty-value option).
   * When true, the label floats even when the control is empty and unfocused.
   */
  readonly hasPlaceholder?: boolean;
  /**
   * When provided, overrides the default floating-label logic (focused || !empty || hasPlaceholder).
   * Use for controls that need custom behavior (e.g. select: float while dropdown is open).
   */
  readonly shouldLabelFloat?: boolean;
  readonly hasRightIcon?: boolean;
}

export const NDWU_CONTROL = new InjectionToken<NdwuControl>('NDWU_CONTROL');

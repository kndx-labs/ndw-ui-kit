import {Injectable} from '@angular/core';

const TOUCH_TIMEOUT = 800;

/**
 * Detector for recent tap gestures on touch devices.
 *
 * Listens to global pointer/touch events (when running in a browser)
 * and exposes a "recent touch" flag that can be used to suppress
 * hover-driven behaviors that would otherwise fire immediately after a tap.
 */
@Injectable({
  providedIn: 'root',
})
export class NdwuTapGestureDetector {
  protected recentTouch: boolean = false;
  protected timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    const markRecentTouch = (): void => {
      this.recentTouch = true;

      if (this.timeoutId !== null) {
        clearTimeout(this.timeoutId);
      }

      this.timeoutId = setTimeout(
        () => {
          this.recentTouch = false;
          this.timeoutId = null;
        },
        TOUCH_TIMEOUT,
      );
    };

    // prefer Pointer Events when available to distinguish pointer types.
    const hasPointerEvents = typeof window.PointerEvent !== 'undefined';

    if (hasPointerEvents) {
      window.addEventListener(
        'pointerdown',
        (event: PointerEvent): void => {
          if (event.pointerType === 'touch') {
            markRecentTouch();
          }
        },
        {capture: true},
      );
    } else {
      // Fallback for environments without Pointer Events support.
      window.addEventListener(
        'touchstart',
        (): void => {
          markRecentTouch();
        },
        {capture: true},
      );
    }
  }

  public isRecentTouch(): boolean {
    return this.recentTouch;
  }
}

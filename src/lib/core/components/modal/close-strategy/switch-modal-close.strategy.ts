import type {OverlayRef} from '@angular/cdk/overlay';
import {Observable} from 'rxjs';
import type {NdwuModalCloseStrategy} from './ndwu-modal-close-strategy';
import {NDWU_MODAL_SWITCH_DURATION_MS, NDWU_MODAL_SWITCH_FADE_OUT_CLASS} from '../ndwu-modal.constants';
import {collapseMobileModal} from './switch-modal-animation';
import {onAnimationEndOrFallback} from '../wait-for-animation-end';

const SWITCH_FALLBACK_DURATION_MS = NDWU_MODAL_SWITCH_DURATION_MS + 50;

export class SwitchModalCloseStrategy implements NdwuModalCloseStrategy {
  constructor(private readonly onFadedOut?: () => void) {}

  public close(overlayRef: OverlayRef): Observable<void> {
    return new Observable<void>((subscriber) => {
      const overlayEl = overlayRef.overlayElement;

      const finalizeClose = (): void => {
        this.onFadedOut?.();

        try {
          overlayRef.dispose();
          subscriber.next();
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      };

      if (overlayEl.classList.contains(NDWU_MODAL_SWITCH_FADE_OUT_CLASS)) {
        finalizeClose();

        return;
      }

      collapseMobileModal(overlayEl);

      return onAnimationEndOrFallback(overlayEl, SWITCH_FALLBACK_DURATION_MS, finalizeClose);
    });
  }
}

import type {OverlayRef} from '@angular/cdk/overlay';
import {Observable} from 'rxjs';
import type {NdwuModalCloseStrategy} from '../close-strategy';
import {NDWU_DRAWER_CLOSE_FALLBACK_DURATION} from './ndwu-drawer.constants';
import {onAnimationEndOrFallback} from '../wait-for-animation-end';

export class NdwuDrawerCloseStrategy implements NdwuModalCloseStrategy {
  public close(overlayRef: OverlayRef): Observable<void> {
    return new Observable<void>((subscriber) => {
      const drawerEl = overlayRef.overlayElement.querySelector<HTMLElement>('.ndwu-drawer');

      if (!drawerEl) {
        subscriber.next();
        subscriber.complete();

        return;
      }

      const finalizeClose = (): void => {
        try {
          overlayRef.dispose();
          subscriber.next();
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      };

      drawerEl.classList.add('ndwu-drawer--closing');

      return onAnimationEndOrFallback(drawerEl, NDWU_DRAWER_CLOSE_FALLBACK_DURATION, finalizeClose);
    });
  }
}

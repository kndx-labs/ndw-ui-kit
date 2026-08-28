import type {OverlayRef} from '@angular/cdk/overlay';
import {Observable} from 'rxjs';
import type {NdwuModalCloseStrategy} from './ndwu-modal-close-strategy';

export class ImmediateCloseStrategy implements NdwuModalCloseStrategy {
  public close(overlayRef: OverlayRef): Observable<void> {
    return new Observable<void>((subscriber) => {
      try {
        overlayRef.dispose();
        subscriber.next();
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    });
  }
}

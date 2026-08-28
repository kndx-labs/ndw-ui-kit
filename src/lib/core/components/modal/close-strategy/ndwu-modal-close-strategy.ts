import type {OverlayRef} from '@angular/cdk/overlay';
import type {Observable} from 'rxjs';

export interface NdwuModalCloseStrategy {
  close(overlayRef: OverlayRef): Observable<void>;
}

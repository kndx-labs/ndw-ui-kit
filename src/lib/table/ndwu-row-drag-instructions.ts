import {Injectable, signal} from '@angular/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';

@Injectable()
export class NdwuRowDragInstructions {
  public readonly id = uniqueId('ndwu-row-drag-instructions-');
  public readonly text = signal<string | null>(null);
}

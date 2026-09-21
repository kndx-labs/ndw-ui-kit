import {Directive} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

/** Makes one row draggable. The bound value is passed back on drop. */
@Directive({
  selector: '[ndwuRowDraggable]',
  hostDirectives: [{
    directive: CdkDrag,
    inputs: ['cdkDragData: ndwuRowDraggable', 'cdkDragDisabled: ndwuRowDraggableDisabled'],
  }],
  host: {
    class: 'ndwu-row-draggable',
  },
})
export class NdwuRowDraggableDirective {}

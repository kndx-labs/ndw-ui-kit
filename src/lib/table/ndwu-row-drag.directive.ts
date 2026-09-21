import {Directive} from '@angular/core';
import {CdkDropList} from '@angular/cdk/drag-drop';

/**
 * Marks the table as a row drop list. The library only reports the move — the
 * host owns the data, so it decides what a reorder means for its own array.
 *
 * Reordering and sorting contradict each other, so a host that allows both
 * disables this while a sort is active.
 */
@Directive({
  selector: '[ndwuRowDrag]',
  hostDirectives: [{
    directive: CdkDropList,
    inputs: ['cdkDropListDisabled: ndwuRowDragDisabled'],
    outputs: ['cdkDropListDropped: ndwuRowDrop'],
  }],
  host: {
    class: 'ndwu-row-drag-list',
  },
})
export class NdwuRowDragDirective {}

import {Directive, OnChanges, booleanAttribute, inject, input, isDevMode} from '@angular/core';
import {CdkDropList} from '@angular/cdk/drag-drop';
import {NdwuSortDirective} from './ndwu-sort.directive';

/**
 * Marks the table as a row drop list. The library only reports the move — the
 * host owns the data, so it decides what a reorder means for its own array.
 *
 * Reordering and sorting contradict each other: a sorted table has no order of
 * its own to drop into. So on a table that also has `ndwuSort`, dragging stays
 * off for good and a warning is logged in dev mode.
 */
@Directive({
  selector: '[ndwuRowDrag]',
  hostDirectives: [{
    directive: CdkDropList,
    outputs: ['cdkDropListDropped: ndwuRowDrop'],
  }],
  host: {
    class: 'ndwu-row-drag-list',
  },
})
export class NdwuRowDragDirective implements OnChanges {
  private readonly dropList = inject(CdkDropList);
  private readonly hasSort = inject(NdwuSortDirective, {optional: true}) !== null;

  public readonly ndwuRowDragDisabled = input(false, {transform: booleanAttribute});

  constructor() {
    if (this.hasSort && isDevMode()) {
      console.warn(
        '[ndw-ui-kit] ndwuRowDrag: the table also has ndwuSort. Row drag is disabled, use one or the other.',
      );
    }

    this.syncDisabled();
  }

  public ngOnChanges(): void {
    this.syncDisabled();
  }

  private syncDisabled(): void {
    this.dropList.disabled = this.hasSort || this.ndwuRowDragDisabled();
  }
}

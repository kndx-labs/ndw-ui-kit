import {Directive, OnChanges, booleanAttribute, inject, input, isDevMode} from '@angular/core';
import {CdkDropList} from '@angular/cdk/drag-drop';
import {NdwuSortDirective} from './ndwu-sort.directive';

/** Only reports the move; the host reorders its data. Always off on a table with `ndwuSort`. */
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

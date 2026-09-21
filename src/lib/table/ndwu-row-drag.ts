import {Component, ChangeDetectionStrategy, Directive, ViewEncapsulation} from '@angular/core';
import {CdkDrag, CdkDragHandle, CdkDropList} from '@angular/cdk/drag-drop';
import {ICON_NAME, NdwuIconComponent} from '@ndw-ui-kit/core';

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

/** The grip in the leading cell; dragging starts here, not anywhere on the row. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwuRowDragHandle]',
  template: '<ndwu-icon [name]="ICON_NAME.MENU_DRAG_S" />',
  styleUrl: './ndwu-row-drag.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkDragHandle],
  imports: [NdwuIconComponent],
  host: {
    class: 'ndwu-row-drag-handle',
    type: 'button',
  },
})
export class NdwuRowDragHandleComponent {
  protected readonly ICON_NAME = ICON_NAME;
}

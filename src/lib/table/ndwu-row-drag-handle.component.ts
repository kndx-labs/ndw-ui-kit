import {Component, ChangeDetectionStrategy} from '@angular/core';
import {CdkDragHandle} from '@angular/cdk/drag-drop';
import {ICON_NAME, NdwuIconComponent} from '@ndw-ui-kit/core';

/** The grip in the leading cell; dragging starts here, not anywhere on the row. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwuRowDragHandle]',
  templateUrl: './ndwu-row-drag-handle.component.html',
  styleUrl: './ndwu-row-drag-handle.component.scss',
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

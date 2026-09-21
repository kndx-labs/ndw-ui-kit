import {Component, ChangeDetectionStrategy, computed, input} from '@angular/core';
import {CdkDragHandle} from '@angular/cdk/drag-drop';
import {ICON_NAME, NdwuIconComponent} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import type {NdwuTableTranslationTexts} from './ndwu-table.types';

const DEFAULT_ROW_DRAG_HANDLE_TEXTS = {
  reorder: 'Reorder row',
};

/** The grip in the leading cell; dragging starts here, not anywhere on the row. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwuRowDragHandle]',
  templateUrl: './ndwu-row-drag-handle.component.html',
  styleUrl: './ndwu-row-drag-handle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkDragHandle],
  imports: [NdwuIconComponent, LocalizePipe],
  host: {
    class: 'ndwu-row-drag-handle',
    type: 'button',
  },
})
export class NdwuRowDragHandleComponent {
  protected readonly ICON_NAME = ICON_NAME;

  public readonly dragTexts = input<NdwuTableTranslationTexts['rowDragHandle']>();

  protected readonly effectiveTexts = computed(() => ({
    ...DEFAULT_ROW_DRAG_HANDLE_TEXTS,
    ...this.dragTexts(),
  }));
}

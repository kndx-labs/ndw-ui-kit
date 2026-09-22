import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import type {NdwuTableTranslationTexts} from './ndwu-table.types';

const DEFAULT_COLUMN_RESIZE_TEXTS = {
  resize: 'Resize column',
};

/**
 * The grip rendered by `NdwuColumnResizeDirective`. It is a component so the
 * name goes through `LocalizePipe` like every other label in the kit; the
 * directive owns the pointer and keyboard handling.
 */
@Component({
  selector: 'ndwu-column-resize-handle',
  templateUrl: './ndwu-column-resize-handle.component.html',
  styleUrl: './ndwu-column-resize-handle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LocalizePipe],
  host: {
    'class': 'ndwu-column-resize-handle',
    'role': 'separator',
    'aria-orientation': 'vertical',
    'tabindex': '0',
    // A separator takes no name from its content, so the hidden text is referenced.
    '[attr.aria-labelledby]': 'labelId',
    '[attr.aria-valuemin]': 'minWidth()',
  },
})
export class NdwuColumnResizeHandleComponent {
  protected readonly labelId = uniqueId('ndwu-column-resize-handle-');

  public readonly minWidth = input(0);
  public readonly resizeTexts = input<NdwuTableTranslationTexts['columnResize']>();

  protected readonly effectiveTexts = computed(() => {
    return {
      ...DEFAULT_COLUMN_RESIZE_TEXTS,
      ...this.resizeTexts(),
    };
  });
}

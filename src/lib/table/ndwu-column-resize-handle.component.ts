import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import type {NdwuTableTranslationTexts} from './ndwu-table.types';

const DEFAULT_COLUMN_RESIZE_TEXTS = {
  resize: 'Resize column',
};

@Component({
  selector: 'ndwu-column-resize-handle',
  templateUrl: './ndwu-column-resize-handle.component.html',
  styleUrl: './ndwu-column-resize-handle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuLocalizePipe],
  host: {
    'class': 'ndwu-column-resize-handle',
    'role': 'separator',
    'aria-orientation': 'vertical',
    'tabindex': '0',
    // A separator takes no name from its content.
    '[attr.aria-labelledby]': 'labelId',
    '[attr.aria-valuemin]': 'minWidth()',
    '[attr.aria-valuemax]': 'maxWidth()',
  },
})
export class NdwuColumnResizeHandleComponent {
  protected readonly labelId = uniqueId('ndwu-column-resize-handle-');

  public readonly minWidth = input(0);
  public readonly maxWidth = input(0);
  public readonly resizeTexts = input<NdwuTableTranslationTexts['columnResize']>();

  protected readonly effectiveTexts = computed(() => {
    return {
      ...DEFAULT_COLUMN_RESIZE_TEXTS,
      ...this.resizeTexts(),
    };
  });
}

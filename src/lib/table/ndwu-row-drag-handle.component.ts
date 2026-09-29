import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {CdkDragHandle} from '@angular/cdk/drag-drop';
import {NDWU_ICON_NAME, NdwuIconComponent, NdwuSizeDirective} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import type {NdwuTableTranslationTexts} from './ndwu-table.types';

const DEFAULT_ROW_DRAG_HANDLE_TEXTS = {
  reorder: 'Reorder row',
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwuRowDragHandle]',
  templateUrl: './ndwu-row-drag-handle.component.html',
  styleUrl: './ndwu-row-drag-handle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkDragHandle, {
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  imports: [NdwuIconComponent, LocalizePipe],
  host: {
    'type': 'button',
    '[class]': 'rootClass()',
  },
})
export class NdwuRowDragHandleComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  protected readonly rootClass = computed(() => {
    return `ndwu-row-drag-handle ndwu-row-drag-handle--${this.sizeSvc.effectiveSize()}`;
  });

  public readonly dragTexts = input<NdwuTableTranslationTexts['rowDragHandle']>();

  protected readonly effectiveTexts = computed(() => {
    return {
      ...DEFAULT_ROW_DRAG_HANDLE_TEXTS,
      ...this.dragTexts(),
    };
  });
}

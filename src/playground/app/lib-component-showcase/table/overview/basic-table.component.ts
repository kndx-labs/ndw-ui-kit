import {ChangeDetectionStrategy, Component, computed, effect, input, signal} from '@angular/core';
import {
  NdwuCellDefDirective,
  NdwuCellDirective,
  NdwuColumnDefDirective,
  NdwuHeaderCellDefDirective,
  NdwuHeaderCellDirective,
  NdwuHeaderRowComponent,
  NdwuHeaderRowDefDirective,
  NdwuRowComponent,
  NdwuRowDefDirective,
  NdwuRowDragDirective,
  NdwuRowDragHandleComponent,
  NdwuRowDraggableDirective,
  NdwuTableComponent,
  NdwuTableToolbarComponent,
  NdwuTableTranslationTexts,
} from '@ndw-ui-kit/core/table';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NdwuBadgeComponent, NdwuButtonComponent} from '@ndw-ui-kit/core';
import type {Device} from './device-table.component';

const BANDS = ['2.4 GHz', '5 GHz'] as const;

@Component({
  selector: 'app-basic-table',
  templateUrl: './basic-table.component.html',
  styleUrl: './basic-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuLocalizePipe,
    NdwuBadgeComponent,
    NdwuButtonComponent,
    NdwuTableComponent,
    NdwuColumnDefDirective,
    NdwuHeaderCellDefDirective,
    NdwuCellDefDirective,
    NdwuHeaderCellDirective,
    NdwuCellDirective,
    NdwuHeaderRowDefDirective,
    NdwuRowDefDirective,
    NdwuHeaderRowComponent,
    NdwuRowComponent,
    NdwuTableToolbarComponent,
    NdwuRowDragDirective,
    NdwuRowDraggableDirective,
    NdwuRowDragHandleComponent,
  ],
})
export class BasicTableComponent {
  public readonly data = input<readonly Device[]>([]);

  protected readonly displayedColumns = ['drag', 'name', 'band', 'ip'];

  protected readonly dragTexts: NdwuTableTranslationTexts['rowDragHandle'] = {
    reorder: 'table.rowDragHandle.reorder',
  };

  protected readonly rows = signal<readonly Device[]>([]);

  protected readonly isEmpty = computed(() => {
    return this.rows().length === 0;
  });

  constructor() {
    effect(() => {
      return this.rows.set(this.data());
    });
  }

  protected trackById(_index: number, row: Device): number {
    return row.id;
  }

  protected onAdd(): void {
    const rows = this.rows();
    const id = rows.reduce((max, row) => {
      return Math.max(max, row.id);
    }, 0) + 1;

    this.rows.update(current => {
      return [...current, {
        id,
        name: `Keenetic-${1000 + Math.floor(Math.random() * 9000)}`,
        band: BANDS[Math.floor(Math.random() * BANDS.length)] ?? BANDS[0],
        ip: `192.168.1.${100 + current.length}`,
        status: 'online',
      }];
    });
  }

  protected onRowDrop(event: CdkDragDrop<unknown>): void {
    this.rows.update(current => {
      const next = [...current];

      moveItemInArray(next, event.previousIndex, event.currentIndex);

      return next;
    });
  }

  protected onRemove(): void {
    this.rows.update(current => {
      return current.slice(0, -1);
    });
  }
}

import {ChangeDetectionStrategy, Component, input, signal} from '@angular/core';
import {
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
} from '@ndw-ui-kit/core/table';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NdwuBadgeComponent, NdwuButtonComponent} from '@ndw-ui-kit/core';
import type {Device} from './device-table.component';

const BANDS = ['2.4 GHz', '5 GHz'] as const;

/**
 * The plain table: no toolbar and no paginator, so every row stays on screen
 * and a row added at the end is visible straight away.
 */
@Component({
  selector: 'app-basic-table',
  templateUrl: './basic-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
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
  ],
})
export class BasicTableComponent {
  public readonly data = input<readonly Device[]>([]);

  protected readonly displayedColumns = ['name', 'band', 'ip'];

  protected readonly added = signal<readonly Device[]>([]);

  protected rows(): readonly Device[] {
    return [...this.data(), ...this.added()];
  }

  protected trackById(_index: number, row: Device): number {
    return row.id;
  }

  protected onAdd(): void {
    const rows = this.rows();
    const id = rows.reduce((max, row) => {
      return Math.max(max, row.id);
    }, 0) + 1;

    this.added.update(current => {
      return [...current, {
        id,
        name: `Keenetic-${1000 + Math.floor(Math.random() * 9000)}`,
        band: BANDS[Math.floor(Math.random() * BANDS.length)] ?? BANDS[0],
        ip: `192.168.1.${100 + rows.length}`,
        status: 'online',
      }];
    });
  }
}

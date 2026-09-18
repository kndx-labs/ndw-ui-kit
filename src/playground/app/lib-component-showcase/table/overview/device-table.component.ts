import {ChangeDetectionStrategy, Component, computed, input, signal} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {
  NdwuTableComponent,
  NdwuColumnDef,
  NdwuHeaderCellDef,
  NdwuCellDef,
  NdwuHeaderCell,
  NdwuCell,
  NdwuHeaderRowDef,
  NdwuRowDef,
  NdwuHeaderRow,
  NdwuRow,
  NdwuNoDataRow,
  NdwuSort,
  NdwuSortHeader,
  NdwuSortState,
  NdwuPaginator,
  NdwuPageEvent,
  NdwuTableToolbar,
  NdwuColumnResize,
  NdwuTableSkeleton,
} from '@ndw-ui-kit/core/table';

export interface Device {
  id: number;
  name: string;
  band: string;
  ip: string;
  status: 'online' | 'offline';
}

@Component({
  selector: 'app-device-table',
  templateUrl: './device-table.component.html',
  styleUrl: './device-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuTableComponent,
    NdwuColumnDef,
    NdwuHeaderCellDef,
    NdwuCellDef,
    NdwuHeaderCell,
    NdwuCell,
    NdwuHeaderRowDef,
    NdwuRowDef,
    NdwuHeaderRow,
    NdwuRow,
    NdwuNoDataRow,
    NdwuSort,
    NdwuSortHeader,
    NdwuPaginator,
    NdwuTableToolbar,
    NdwuColumnResize,
    NdwuTableSkeleton,
  ],
})
export class DeviceTableComponent {
  readonly data = input.required<Device[]>();

  protected readonly displayedColumns = ['select', 'name', 'band', 'ip', 'status', 'actions'];
  /** Mirrors the .col-* widths so the skeleton and the loaded table line up. */
  protected readonly skeletonWidths = ['48px', '170px', '88px', '130px', '96px', '72px'];

  protected readonly selection = new SelectionModel<Device>(true, []);
  protected readonly filterText = signal('');
  protected readonly loading = signal(false);
  protected readonly expandedRows = signal<Set<number>>(new Set());

  protected readonly sortState = signal<NdwuSortState>({active: '', direction: ''});
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(5);

  protected readonly filteredData = computed(() => {
    const text = this.filterText().toLowerCase();
    const data = this.data();
    if (!text) return data;
    return data.filter(d =>
      d.name.toLowerCase().includes(text) ||
      d.ip.includes(text) ||
      d.band.toLowerCase().includes(text)
    );
  });

  protected readonly sortedData = computed(() => {
    const data = [...this.filteredData()];
    const {active, direction} = this.sortState();
    if (!active || !direction) return data;

    return data.sort((a, b) => {
      const cmp = String(a[active as keyof Device]).localeCompare(String(b[active as keyof Device]));
      return direction === 'asc' ? cmp : -cmp;
    });
  });

  protected readonly dataSource = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.sortedData().slice(start, start + this.pageSize());
  });

  protected readonly isAllSelected = computed(() => {
    const data = this.dataSource();
    return data.length > 0 && data.every(d => this.selection.isSelected(d));
  });

  protected readonly isIndeterminate = computed(() => {
    const data = this.dataSource();
    const selectedCount = data.filter(d => this.selection.isSelected(d)).length;
    return selectedCount > 0 && selectedCount < data.length;
  });

  protected toggleAll(): void {
    if (this.isAllSelected()) {
      this.selection.deselect(...this.dataSource());
    } else {
      this.selection.select(...this.dataSource());
    }
  }

  protected onFilterChange(event: Event): void {
    this.filterText.set((event.target as HTMLInputElement).value);
    this.pageIndex.set(0);
  }

  protected onSortChange(state: NdwuSortState): void {
    this.sortState.set(state);
    this.pageIndex.set(0);
  }

  protected onPageChange(event: NdwuPageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected toggleExpand(id: number): void {
    const current = new Set(this.expandedRows());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.expandedRows.set(current);
  }

  protected isExpanded(id: number): boolean {
    return this.expandedRows().has(id);
  }

  protected isDetailRow = (_index: number, _row: Device): boolean => true;

  protected toggleLoading(): void {
    this.loading.update(v => !v);
  }

  protected onEdit(device: Device): void {
    console.log('Edit:', device.name);
  }

  protected onDelete(device: Device): void {
    console.log('Delete:', device.name);
  }

  protected trackById(_index: number, device: Device): number {
    return device.id;
  }
}

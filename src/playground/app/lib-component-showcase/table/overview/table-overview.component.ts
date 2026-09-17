import {ChangeDetectionStrategy, Component, signal, computed} from '@angular/core';
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

interface Device {
  id: number;
  name: string;
  band: string;
  ip: string;
  status: 'online' | 'offline';
}

const DEVICES: Device[] = [
  {id: 1, name: 'Keenetic-9067', band: '2.4 GHz', ip: '192.168.1.1', status: 'online'},
  {id: 2, name: 'Keenetic-8700', band: '5 GHz', ip: '192.168.1.2', status: 'online'},
  {id: 3, name: 'Hogwarts-IoT', band: '2.4 GHz', ip: '192.168.1.15', status: 'offline'},
  {id: 4, name: 'dev', band: '5 GHz', ip: '192.168.1.20', status: 'online'},
  {id: 5, name: 'Keenetic-9067-Teens', band: '5 GHz', ip: '192.168.1.33', status: 'online'},
  {id: 6, name: 'Guest-Network', band: '2.4 GHz', ip: '192.168.1.50', status: 'offline'},
  {id: 7, name: 'Lab-5G', band: '5 GHz', ip: '192.168.1.60', status: 'online'},
  {id: 8, name: 'Office-Main', band: '2.4 GHz', ip: '192.168.1.70', status: 'online'},
  {id: 9, name: 'Garage-AP', band: '2.4 GHz', ip: '192.168.1.80', status: 'offline'},
  {id: 10, name: 'Backyard-Mesh', band: '5 GHz', ip: '192.168.1.90', status: 'online'},
  {id: 11, name: 'Basement-Node', band: '2.4 GHz', ip: '192.168.1.100', status: 'offline'},
  {id: 12, name: 'Attic-Repeater', band: '5 GHz', ip: '192.168.1.110', status: 'online'},
];

@Component({
  selector: 'app-table-overview',
  templateUrl: './table-overview.component.html',
  styleUrl: './table-overview.component.scss',
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
export class TableOverviewComponent {
  protected readonly displayedColumns = ['select', 'name', 'band', 'ip', 'status', 'actions'];
  protected readonly darkColumns = ['name', 'band', 'ip', 'status'];
  protected readonly darkData = DEVICES.slice(0, 5);
  protected readonly allData = signal(DEVICES);
  protected readonly selection = new SelectionModel<Device>(true, []);
  protected readonly filterText = signal('');
  protected readonly loading = signal(false);
  protected readonly expandedRows = signal<Set<number>>(new Set());

  protected readonly sortState = signal<NdwuSortState>({active: '', direction: ''});
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(5);

  protected readonly filteredData = computed(() => {
    const text = this.filterText().toLowerCase();
    const data = this.allData();
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
      const aVal = a[active as keyof Device];
      const bVal = b[active as keyof Device];
      const cmp = String(aVal).localeCompare(String(bVal));
      return direction === 'asc' ? cmp : -cmp;
    });
  });

  protected readonly dataSource = computed(() => {
    const sorted = this.sortedData();
    const start = this.pageIndex() * this.pageSize();
    return sorted.slice(start, start + this.pageSize());
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

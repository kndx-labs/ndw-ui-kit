import {ChangeDetectionStrategy, Component, computed, input, linkedSignal, signal} from '@angular/core';
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
  TranslationTexts,
} from '@ndw-ui-kit/core/table';
import {
  NdwuBadgeComponent,
  NdwuButtonComponent,
  NdwuIconButtonComponent,
  NdwuIconComponent,
  NdwuToggleComponent,
} from '@ndw-ui-kit/core';

export interface Device {
  id: number;
  name: string;
  band: string;
  ip: string;
  status: 'online' | 'offline';
}

const NAME_PREFIXES = ['Keenetic', 'Guest', 'Lab', 'Office', 'Mesh', 'Repeater'] as const;
const BANDS = ['2.4 GHz', '5 GHz'] as const;
const STATUSES = ['online', 'offline'] as const satisfies readonly Device['status'][];

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
    NdwuBadgeComponent,
    NdwuButtonComponent,
    NdwuIconButtonComponent,
    NdwuIconComponent,
    NdwuToggleComponent,
  ],
})
export class DeviceTableComponent {
  /** Overrides the library's English defaults with keys from the app dictionary. */
  protected readonly translationTexts: TranslationTexts = {
    paginator: {
      itemsPerPage: 'table.paginator.itemsPerPage',
      range: 'table.paginator.range',
      rangeEmpty: 'table.paginator.rangeEmpty',
      firstPage: 'table.paginator.firstPage',
      previousPage: 'table.paginator.previousPage',
      nextPage: 'table.paginator.nextPage',
      lastPage: 'table.paginator.lastPage',
    },
    skeleton: {
      loading: 'table.skeleton.loading',
    },
  };

  readonly data = input.required<Device[]>();

  /**
   * Working copy: add and delete mutate this, and it re-seeds if the host swaps
   * the input. The two demo tables therefore edit independently.
   */
  protected readonly rows = linkedSignal(() => this.data());

  protected readonly displayedColumns =
    ['select', 'enabled', 'name', 'band', 'ip', 'status', 'actions'];
  /** Mirrors the .col-* widths so the skeleton and the loaded table line up. */
  protected readonly skeletonWidths =
    ['48px', '72px', '170px', '88px', '130px', '96px', '88px'];

  /**
   * Selection is signal state, not a `SelectionModel`: the header checkbox and
   * the toolbar counter read it from `computed`s, which only re-run when a
   * signal they read changes.
   */
  private readonly selectedIds = signal<ReadonlySet<number>>(new Set());
  protected readonly selectedCount = computed(() => this.selectedIds().size);
  protected readonly filterText = signal('');
  protected readonly loading = signal(false);
  protected readonly expandedRows = signal<Set<number>>(new Set());
  /** Only rows the user flipped; every other row follows the device's own status. */
  private readonly toggledRows = signal<ReadonlySet<number>>(new Set());
  /** Echoes the last toolbar/row action, so the stubs are visible in the demo. */
  protected readonly lastAction = signal('');

  protected readonly sortState = signal<NdwuSortState>({active: '', direction: ''});
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(5);

  protected readonly filteredData = computed(() => {
    const text = this.filterText().toLowerCase();
    const data = this.rows();
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

  /** Header checkbox and its indeterminate state cover the current page only. */
  private readonly pageSelectedCount = computed(() => {
    const ids = this.selectedIds();
    return this.dataSource().filter(d => ids.has(d.id)).length;
  });

  protected readonly isAllSelected = computed(() => {
    const data = this.dataSource();
    return data.length > 0 && this.pageSelectedCount() === data.length;
  });

  protected readonly isIndeterminate = computed(() => {
    const count = this.pageSelectedCount();
    return count > 0 && count < this.dataSource().length;
  });

  protected isSelected(device: Device): boolean {
    return this.selectedIds().has(device.id);
  }

  protected toggleRow(device: Device): void {
    const next = new Set(this.selectedIds());
    if (!next.delete(device.id)) {
      next.add(device.id);
    }
    this.selectedIds.set(next);
  }

  protected toggleAll(): void {
    const page = this.dataSource();
    const next = new Set(this.selectedIds());

    if (this.isAllSelected()) {
      page.forEach(d => next.delete(d.id));
    } else {
      page.forEach(d => next.add(d.id));
    }
    this.selectedIds.set(next);
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

  protected isEnabled(device: Device): boolean {
    return this.toggledRows().has(device.id)
      ? device.status !== 'online'
      : device.status === 'online';
  }

  protected toggleEnabled(device: Device): void {
    const next = new Set(this.toggledRows());
    if (!next.delete(device.id)) {
      next.add(device.id);
    }
    this.toggledRows.set(next);
  }

  protected onRowMenu(device: Device): void {
    this.lastAction.set(`Row menu: ${device.name}`);
  }

  protected onDelete(device: Device): void {
    this.removeRows([device]);
    this.lastAction.set(`Deleted ${device.name}`);
  }

  protected onAdd(): void {
    const device = this.randomDevice();
    this.rows.update(rows => [...rows, device]);
    this.lastAction.set(`Added ${device.name}`);
  }

  protected onDeleteSelected(): void {
    const ids = this.selectedIds();
    const doomed = this.rows().filter(d => ids.has(d.id));
    if (doomed.length === 0) return;

    this.removeRows(doomed);
    this.lastAction.set(`Deleted ${doomed.length} network(s)`);
  }

  private randomDevice(): Device {
    const rows = this.rows();
    const id = rows.reduce((max, d) => Math.max(max, d.id), 0) + 1;
    const pick = <T>(values: readonly [T, ...T[]]): T =>
      values[Math.floor(Math.random() * values.length)] ?? values[0];

    return {
      id,
      name: `${pick(NAME_PREFIXES)}-${1000 + Math.floor(Math.random() * 9000)}`,
      band: pick(BANDS),
      // Keep the host octet clear of the 1-120 range the seed data uses.
      ip: `192.168.1.${121 + Math.floor(Math.random() * 130)}`,
      status: pick(STATUSES),
    };
  }

  private removeRows(doomed: readonly Device[]): void {
    const ids = new Set(doomed.map(d => d.id));

    this.rows.update(rows => rows.filter(d => !ids.has(d.id)));
    this.selectedIds.update(set => new Set([...set].filter(id => !ids.has(id))));
    this.expandedRows.update(set => new Set([...set].filter(id => !ids.has(id))));
    this.clampPageIndex();
  }

  /** Deleting the tail of the list can leave `pageIndex` past the last page. */
  private clampPageIndex(): void {
    const lastPage = Math.max(0, Math.ceil(this.filteredData().length / this.pageSize()) - 1);

    if (this.pageIndex() > lastPage) {
      this.pageIndex.set(lastPage);
    }
  }

  protected onSettings(): void {
    this.lastAction.set('Column settings');
  }

  protected trackById(_index: number, device: Device): number {
    return device.id;
  }
}

import {ChangeDetectionStrategy, Component, computed, input, linkedSignal, signal} from '@angular/core';
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
  NdwuNoDataRowDirective,
  NdwuSortDirective,
  NdwuSortHeaderComponent,
  NdwuSortState,
  NdwuPaginatorComponent,
  NdwuPageEvent,
  NdwuTableToolbarComponent,
  NdwuColumnResizeDirective,
  NdwuTableSkeletonComponent,
  NdwuRowDragDirective,
  NdwuRowDraggableDirective,
  NdwuRowDragHandleComponent,
  NdwuColumnPinComponent,
  NdwuTableTranslationTexts,
} from '@ndw-ui-kit/core/table';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
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

interface ActionMessage {
  key: string;
  params?: Record<string, string | number>;
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
    NdwuColumnDefDirective,
    NdwuHeaderCellDefDirective,
    NdwuCellDefDirective,
    NdwuHeaderCellDirective,
    NdwuCellDirective,
    NdwuHeaderRowDefDirective,
    NdwuRowDefDirective,
    NdwuHeaderRowComponent,
    NdwuRowComponent,
    NdwuNoDataRowDirective,
    NdwuSortDirective,
    NdwuSortHeaderComponent,
    NdwuPaginatorComponent,
    NdwuTableToolbarComponent,
    NdwuColumnResizeDirective,
    NdwuTableSkeletonComponent,
    NdwuRowDragDirective,
    NdwuRowDraggableDirective,
    NdwuRowDragHandleComponent,
    NdwuColumnPinComponent,
    NdwuBadgeComponent,
    NdwuButtonComponent,
    NdwuIconButtonComponent,
    NdwuIconComponent,
    NdwuToggleComponent,
    LocalizePipe,
  ],
})
export class DeviceTableComponent {
  /** Overrides the library's English defaults with keys from the app dictionary. */
  protected readonly translationTexts: NdwuTableTranslationTexts = {
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

  public readonly data = input.required<Device[]>();

  /**
   * Working copy: add and delete mutate this, and it re-seeds if the host swaps
   * the input. The two demo tables therefore edit independently.
   */
  protected readonly rows = linkedSignal(() => this.data());

  protected readonly displayedColumns =
    ['drag', 'select', 'enabled', 'name', 'band', 'ip', 'status', 'actions'];
  /** Mirrors the .col-* widths so the skeleton and the loaded table line up. */
  protected readonly skeletonWidths =
    ['40px', '48px', '72px', '170px', '88px', '130px', '96px', '88px'];

  protected readonly namePinned = signal(false);

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
  /**
   * Echoes the last toolbar/row action, so the stubs are visible in the demo.
   * Stored as key plus params, so it re-renders in the new language on switch.
   */
  protected readonly lastAction = signal<ActionMessage | null>(null);

  protected readonly sortState = signal<NdwuSortState>({active: '', direction: ''});
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(5);

  protected readonly filteredData = computed(() => {
    const text = this.filterText().toLowerCase();
    const data = this.rows();

    if (!text) {
      return data;
    }

    return data.filter(d =>
      d.name.toLowerCase().includes(text) ||
      d.ip.includes(text) ||
      d.band.toLowerCase().includes(text)
    );
  });

  /** A sorted table has no meaningful drop target, so reordering is off then. */
  protected readonly isSorted = computed(() => {
    const {active, direction} = this.sortState();

    return active !== '' && direction !== '';
  });

  protected readonly sortedData = computed(() => {
    const data = [...this.filteredData()];
    const {active, direction} = this.sortState();

    if (!active || !direction) {
      return data;
    }

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

  /**
   * The drop indices are page-relative, so the move is replayed on the full
   * array by id: that survives both paging and an active filter.
   */
  protected onRowDrop(event: CdkDragDrop<unknown>): void {
    const page = this.dataSource();
    const moved = page[event.previousIndex];
    const target = page[event.currentIndex];

    if (!moved || !target || moved === target) {
      return;
    }

    this.rows.update(rows => {
      const next = [...rows];
      const from = next.findIndex(d => d.id === moved.id);
      const to = next.findIndex(d => d.id === target.id);

      if (from === -1 || to === -1) {
        return rows;
      }

      next.splice(to, 0, ...next.splice(from, 1));

      return next;
    });
    this.lastAction.set({key: 'table-showcase.overview.action.moved', params: {name: moved.name}});
  }

  protected onRowMenu(device: Device): void {
    this.lastAction.set({key: 'table-showcase.overview.action.row-menu', params: {name: device.name}});
  }

  protected onDelete(device: Device): void {
    this.removeRows([device]);
    this.lastAction.set({key: 'table-showcase.overview.action.deleted', params: {name: device.name}});
  }

  protected onAdd(): void {
    const device = this.randomDevice();

    this.rows.update(rows => [...rows, device]);
    this.lastAction.set({key: 'table-showcase.overview.action.added', params: {name: device.name}});
  }

  protected onDeleteSelected(): void {
    const ids = this.selectedIds();
    const doomed = this.rows().filter(d => ids.has(d.id));

    if (doomed.length === 0) {
      return;
    }

    this.removeRows(doomed);
    this.lastAction.set({
      key: 'table-showcase.overview.action.deleted-many',
      params: {count: doomed.length},
    });
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
    this.lastAction.set({key: 'table-showcase.overview.action.settings'});
  }

  /** Demo-only derived detail values; the dictionary supplies the wording around them. */
  protected macFor(device: Device): string {
    return `AA:BB:CC:${device.id.toString().padStart(2, '0')}:DD:EE`;
  }

  protected dbmFor(device: Device): number {
    return 30 + device.id * 3;
  }

  protected trackById(_index: number, device: Device): number {
    return device.id;
  }
}

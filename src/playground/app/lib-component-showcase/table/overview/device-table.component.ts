import {ChangeDetectionStrategy, Component, computed, effect, input, signal} from '@angular/core';
import {
  NdwuCellDefDirective,
  NdwuCellDirective,
  NdwuColumnDefDirective,
  NdwuColumnPinComponent,
  NdwuColumnResizeDirective,
  NdwuHeaderCellDefDirective,
  NdwuHeaderCellDirective,
  NdwuHeaderRowComponent,
  NdwuHeaderRowDefDirective,
  NdwuNoDataRowDirective,
  NdwuPaginatorComponent,
  NdwuRowComponent,
  NdwuRowDefDirective,
  NdwuSortDirective,
  NdwuSortHeaderComponent,
  NdwuTableComponent,
  NdwuTableDataSource,
  NdwuTableSkeletonComponent,
  NdwuTableToolbarComponent,
  NdwuTableTranslationTexts,
} from '@ndw-ui-kit/core/table';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {
  NDWU_ICON_NAME,
  NdwuBadgeComponent,
  NdwuButtonComponent,
  NdwuCheckboxComponent,
  NdwuEmptyStateComponent,
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
    NdwuColumnPinComponent,
    NdwuBadgeComponent,
    NdwuButtonComponent,
    NdwuEmptyStateComponent,
    NdwuCheckboxComponent,
    NdwuIconButtonComponent,
    NdwuIconComponent,
    NdwuToggleComponent,
    LocalizePipe,
  ],
})
export class DeviceTableComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;

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
    columnPin: {
      pin: 'table.columnPin.pin',
      unpin: 'table.columnPin.unpin',
    },
    columnResize: {
      resize: 'table.columnResize.resize',
    },
  };

  public readonly data = input.required<Device[]>();

  protected readonly dataSource = new NdwuTableDataSource<Device>({
    filterPredicate: (device, filter) => {
      return device.name.toLowerCase().includes(filter)
        || device.ip.includes(filter)
        || device.band.toLowerCase().includes(filter);
    },
  });

  protected readonly rows = this.dataSource.data;

  protected readonly displayedColumns = ['select', 'enabled', 'name', 'band', 'ip', 'status', 'actions'];
  protected readonly skeletonWidths = ['48px', '72px', '170px', '88px', '130px', '96px', '88px'];

  protected readonly namePinned = signal(false);

  private readonly selectedIds = signal<ReadonlySet<number>>(new Set());
  protected readonly selectedCount = computed(() => this.selectedIds().size);
  protected readonly loading = signal(false);
  protected readonly expandedRows = signal<Set<number>>(new Set());
  private readonly toggledRows = signal<ReadonlySet<number>>(new Set());
  protected readonly lastAction = signal<ActionMessage | null>(null);

  protected readonly pageIndex = this.dataSource.pageIndex;
  protected readonly pageSize = this.dataSource.pageSize;

  protected readonly visibleRows = this.dataSource.page;

  constructor() {
    this.pageSize.set(5);

    effect(() => this.rows.set(this.data()));
  }

  private readonly pageSelectedCount = computed(() => {
    const ids = this.selectedIds();

    return this.visibleRows().filter(d => ids.has(d.id)).length;
  });

  protected readonly isAllSelected = computed(() => {
    const data = this.visibleRows();

    return data.length > 0 && this.pageSelectedCount() === data.length;
  });

  protected readonly isIndeterminate = computed(() => {
    const count = this.pageSelectedCount();

    return count > 0 && count < this.visibleRows().length;
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
    const page = this.visibleRows();
    const next = new Set(this.selectedIds());

    if (this.isAllSelected()) {
      page.forEach(d => next.delete(d.id));
    } else {
      page.forEach(d => next.add(d.id));
    }

    this.selectedIds.set(next);
  }

  protected onFilterChange(event: Event): void {
    this.dataSource.filter.set((event.target as HTMLInputElement).value);
    this.pageIndex.set(0);
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
    this.lastAction.set({key: 'table-showcase.overview.action.row-menu', params: {name: device.name}});
  }

  protected onDelete(device: Device): void {
    this.removeRows([device]);
    this.lastAction.set({key: 'table-showcase.overview.action.deleted', params: {name: device.name}});
  }

  protected onAdd(): void {
    const device = this.randomDevice();

    this.rows.update(rows => [...rows, device]);
    this.pageIndex.set(Math.max(0, Math.ceil(this.rows().length / this.pageSize()) - 1));
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
    const pick = <T>(values: readonly [T, ...T[]]): T => {
      return values[Math.floor(Math.random() * values.length)] ?? values[0];
    };

    return {
      id,
      name: `${pick(NAME_PREFIXES)}-${1000 + Math.floor(Math.random() * 9000)}`,
      band: pick(BANDS),
      ip: `192.168.1.${121 + Math.floor(Math.random() * 130)}`,
      status: pick(STATUSES),
    };
  }

  private removeRows(doomed: readonly Device[]): void {
    const ids = new Set(doomed.map(d => d.id));

    this.rows.update(rows => rows.filter(d => !ids.has(d.id)));
    this.selectedIds.update(set => new Set([...set].filter(id => !ids.has(id))));
    this.expandedRows.update(set => new Set([...set].filter(id => !ids.has(id))));
  }

  protected onSettings(): void {
    this.lastAction.set({key: 'table-showcase.overview.action.settings'});
  }

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

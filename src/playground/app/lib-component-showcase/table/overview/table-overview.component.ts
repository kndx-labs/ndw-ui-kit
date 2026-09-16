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
  ],
})
export class TableOverviewComponent {
  protected readonly displayedColumns = ['select', 'name', 'band', 'ip', 'status', 'actions'];
  protected readonly dataSource = signal(DEVICES);
  protected readonly selection = new SelectionModel<Device>(true, []);

  protected readonly isAllSelected = computed(() => {
    const data = this.dataSource();
    return data.length > 0 && this.selection.selected.length === data.length;
  });

  protected readonly isIndeterminate = computed(() => {
    return this.selection.hasValue() && !this.isAllSelected();
  });

  protected toggleAll(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.dataSource());
    }
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

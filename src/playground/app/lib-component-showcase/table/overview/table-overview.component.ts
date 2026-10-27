import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {Device, DeviceTableComponent} from './device-table.component';
import {BasicTableComponent} from './basic-table.component';

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
  imports: [BasicTableComponent, DeviceTableComponent, NdwuLocalizePipe],
})
export class TableOverviewComponent {
  protected readonly devices = DEVICES;

  protected readonly basicDevices = DEVICES.slice(0, 5);
}

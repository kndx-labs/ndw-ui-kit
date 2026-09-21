import {Component, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'ndwu-table-toolbar',
  exportAs: 'ndwuTableToolbar',
  templateUrl: './ndwu-table-toolbar.component.html',
  styleUrl: './ndwu-table-toolbar.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ndwu-table-toolbar',
  },
})
export class NdwuTableToolbarComponent {}

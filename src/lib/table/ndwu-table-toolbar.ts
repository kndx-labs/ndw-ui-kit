import {Component, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'ndwu-table-toolbar',
  exportAs: 'ndwuTableToolbar',
  template: `
    <div class="ndwu-table-toolbar-start">
      <ng-content select="[ndwuTableToolbarStart]" />
    </div>
    <div class="ndwu-table-toolbar-end">
      <ng-content select="[ndwuTableToolbarEnd]" />
    </div>
  `,
  styleUrl: './ndwu-table-toolbar.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ndwu-table-toolbar',
  },
})
export class NdwuTableToolbarComponent {}

import {Component, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import {
  CDK_TABLE,
  CdkTable,
  DataRowOutlet,
  HeaderRowOutlet,
  FooterRowOutlet,
  NoDataRowOutlet,
} from '@angular/cdk/table';
import {_DisposeViewRepeaterStrategy, _VIEW_REPEATER_STRATEGY} from '@angular/cdk/collections';

@Component({
  selector: 'ndwu-table',
  exportAs: 'ndwuTable',
  template: `
    <ng-content select="caption" />
    <ng-content select="colgroup, col" />
    <table>
      <thead role="rowgroup">
        <ng-container headerRowOutlet />
      </thead>
      <tbody role="rowgroup">
        <ng-container rowOutlet />
        <ng-container noDataRowOutlet />
      </tbody>
      <tfoot role="rowgroup">
        <ng-container footerRowOutlet />
      </tfoot>
    </table>
  `,
  styleUrl: './ndwu-table.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    {provide: CDK_TABLE, useExisting: NdwuTableComponent},
    {provide: CdkTable, useExisting: NdwuTableComponent},
    {provide: _VIEW_REPEATER_STRATEGY, useClass: _DisposeViewRepeaterStrategy},
  ],
  imports: [HeaderRowOutlet, DataRowOutlet, FooterRowOutlet, NoDataRowOutlet],
  host: {
    class: 'ndwu-table',
  },
})
export class NdwuTableComponent<T> extends CdkTable<T> {
  protected override stickyCssClass = 'ndwu-table-sticky';
  protected override needsPositionStickyOnElement = false;
}

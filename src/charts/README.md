# @ndw-ui-kit/charts

Chart components for Angular. This package has a peer dependency on
`@ndw-ui-kit/core`.

```sh
yarn add @ndw-ui-kit/core @ndw-ui-kit/charts
```

Add core and charts theme styles in this order in `angular.json`:

```json
"styles": [
  "node_modules/@ndw-ui-kit/core/styles/themes.scss",
  "node_modules/@ndw-ui-kit/charts/styles/themes.scss"
]
```

Alternatively, use Sass imports with core first:

```scss
@use '@ndw-ui-kit/core/styles/themes';
@use '@ndw-ui-kit/charts/styles/themes';
```

## Heat strip

Import the standalone component and typed tooltip directive from the charts
package. Add the core theme before the charts theme as shown above.

```ts
import {Component} from '@angular/core';
import {
  NdwuHeatStripComponent,
  NdwuHeatStripTooltipDirective,
  type NdwuHeatStripCell,
} from '@ndw-ui-kit/charts';

@Component({
  standalone: true,
  imports: [NdwuHeatStripComponent, NdwuHeatStripTooltipDirective],
  template: `
    <ndwu-heat-strip [cells]="cells" [axisLabels]="axisLabels">
      <ng-template [ndwuHeatStripTooltip]="cells" let-cell let-index="index">
        {{ index }}: {{ cell.data?.label }}
      </ng-template>
    </ndwu-heat-strip>
  `,
})
export class ExampleComponent {
  public readonly cells: readonly NdwuHeatStripCell<{label: string}>[] = [
    {level: 0, data: {label: 'Low'}},
    {level: 3, marker: true, data: {label: 'Marked'}},
    {level: null, data: {label: 'Unavailable'}},
  ];

  public readonly axisLabels = ['00:00', '12:00', '24:00'];
}
```

The tooltip template receives the cell as its implicit value and its position
as `index`. A marker template can be projected with
`ng-template[ndwuHeatStripMarker]`; marked cells use a built-in inset border
when no marker template is present.

`cells` is required. `trackBy` defaults to the array index. Custom keys must be
unique within each `cells` array and stable for the same logical cell across
updates. Duplicate keys are a consumer error; Angular reports `NG0955` in dev
mode, and the component does not deduplicate them. `axisLabels` adds an axis;
`loading` disables interaction while loading. Accessibility can be customized
with `ariaLabel`, `cellLabel`, `levelLabels`, `noDataLabel`, `markerLabel`, and
`emptyLabel`.

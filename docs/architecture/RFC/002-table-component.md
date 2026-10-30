- Feature Name: Table
- Status: draft
- Start Date: 2026-09-24
- Authors: tagshch
- RFC PR(s): https://github.com/kndx-labs/ndw-ui-kit/pull/8
- Issue(s): NDWU-101

# Summary

This document explains how `@ndw-ui-kit/core/table` is built, which part is
responsible for what, and how a consumer puts the parts together.

The table is a thin styled layer over the Angular CDK table. Every `ndwu*`
structural directive extends its `Cdk*` counterpart and is provided under the
CDK token, so the CDK renders the rows and the kit owns markup, styles and
accessibility. Features (sort, paging, pin, resize, row drag) are separate
opt-in directives and components. They **only report intent**: the host owns
the state and feeds it back, usually through `NdwuTableDataSource`.

# Technical design

The table can be divided into four layers:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Chrome: toolbar, skeleton, paginator                                │  <- Around the table
├──────────────────────────────────────────────────────────────────────┤
│  Features: sort, column pin, column resize, row drag                 │  <- Opt-in, report intent
├──────────────────────────────────────────────────────────────────────┤
│  Structure: ndwu-table, column/row/cell defs, rows, cells            │  <- CDK subclasses
├──────────────────────────────────────────────────────────────────────┤
│  Data: NdwuTableDataSource (data → filter → sort → page)             │  <- Signals
└──────────────────────────────────────────────────────────────────────┘
```

The layers depend only downwards. Features know nothing about the data source;
the host connects them in its template.

## Component Map

### Data

| Class                        | Type             | Role                                                                                                 |
|------------------------------|------------------|------------------------------------------------------------------------------------------------------|
| `NdwuTableDataSource<T, V>`  | `DataSource<T>`  | Signals `data`, `filter`, `sort`, `pageSize`, `pageIndex`; computes `filtered → sorted → page`, `length`, `isSorted` |
| `NdwuTableDataSourceOptions` | Interface        | `sortAccessor`, `sortComparator`, `filterPredicate`, `injector` (when built outside an injection context) |

A plain array is also a valid `[dataSource]`. Use it when the host does its own
sorting or paging, e.g. on the server.

### Structure

| Class                         | Selector                                    | Extends            | Role                                                                     |
|-------------------------------|---------------------------------------------|--------------------|--------------------------------------------------------------------------|
| `NdwuTableComponent`          | `<ndwu-table>`                              | `CdkTable`         | Renders a native `<table>`; sticky class `ndwu-table-sticky`; unencapsulated styles |
| `NdwuColumnDefDirective`      | `[ndwuColumnDef]`                           | `CdkColumnDef`     | Names a column; inherited `[sticky]`, `[stickyEnd]` freeze it          |
| `NdwuHeaderCellDefDirective`  | `*ndwuHeaderCellDef`                        | `CdkHeaderCellDef` | Header cell template                                                     |
| `NdwuCellDefDirective`        | `*ndwuCellDef="let row"`                    | `CdkCellDef`       | Body cell template                                                       |
| `NdwuFooterCellDefDirective`  | `*ndwuFooterCellDef`                        | `CdkFooterCellDef` | Footer cell template                                                     |
| `NdwuHeaderCellDirective`     | `th[ndwuHeaderCell]`                        | `CdkHeaderCell`    | Header cell; adds `scope="col"`                                         |
| `NdwuCellDirective`           | `td[ndwuCell]`                              | `CdkCell`          | Body cell                                                                |
| `NdwuFooterCellDirective`     | `td[ndwuFooterCell]`                        | `CdkFooterCell`    | Footer cell                                                              |
| `NdwuHeaderRowDefDirective`   | `*ndwuHeaderRowDef="cols; sticky: true"`    | `CdkHeaderRowDef`  | Header row columns; optional sticky header                               |
| `NdwuRowDefDirective`         | `*ndwuRowDef="let row; columns: cols"`      | `CdkRowDef`        | Body row columns; optional `when` predicate for multi-template rows      |
| `NdwuFooterRowDefDirective`   | `*ndwuFooterRowDef`                         | `CdkFooterRowDef`  | Footer row columns                                                       |
| `NdwuHeaderRowComponent`      | `<ndwu-header-row>`                         | `CdkHeaderRow`     | Header `<tr>`                                                            |
| `NdwuRowComponent`            | `<ndwu-row>`                                | `CdkRow`           | Body `<tr>`; state classes `ndwu-row--selected`, `--expandable`, `--detail` |
| `NdwuFooterRowComponent`      | `<ndwu-footer-row>`                         | `CdkFooterRow`     | Footer `<tr>`                                                            |
| `NdwuNoDataRowDirective`      | `ng-template[ndwuNoDataRow]`                | `CdkNoDataRow`     | Shown when the data source emits no rows                                 |

### Features

| Class                         | Selector                    | Role                                                                                                   |
|-------------------------------|-----------------------------|--------------------------------------------------------------------------------------------------------|
| `NdwuSortDirective`           | `[ndwuSort]` on the table   | Sort state: one `ndwuSort` model of `NdwuSortState`; cycles `asc → desc → ''`; emits `ndwuSortChange` |
| `NdwuSortHeaderComponent`     | `th[ndwuSortHeader="id"]`   | Button inside the header cell that calls `sort(id)`; sets `aria-sort`; projects `[ndwuColumnPin]`, `[ndwuSortHeaderAction]` |
| `NdwuColumnPinComponent`      | `button[ndwuColumnPin]`     | Toggle with `pinned` input and `pinnedChange` output; `aria-pressed`; stops the click from sorting     |
| `NdwuColumnResizeDirective`   | `th[ndwuColumnResize]`      | Creates the grip in the cell; pointer drag or arrow keys set the cell width (min 40px); emits `ndwuColumnResized` |
| `NdwuColumnResizeHandleComponent` | `<ndwu-column-resize-handle>` | The grip, created by the directive. Focusable `role="separator"` with `aria-valuenow/min/max`  |
| `NdwuRowDragDirective`        | `[ndwuRowDrag]` on the table| Hosts `CdkDropList`, emits `ndwuRowDrop`; disabled when the table also has `ndwuSort`                  |
| `NdwuRowDraggableDirective`   | `[ndwuRowDraggable]="row"`  | Hosts `CdkDrag` on a row; the bound value is the drag data                                             |
| `NdwuRowDragHandleComponent`  | `button[ndwuRowDragHandle]` | Hosts `CdkDragHandle`; dragging starts only here. Keyboard: Space/Enter grabs, arrows/Home/End move, Escape cancels |

### Chrome

| Class                        | Selector                 | Role                                                                                |
|------------------------------|--------------------------|-------------------------------------------------------------------------------------|
| `NdwuTableToolbarComponent`  | `<ndwu-table-toolbar>`   | Two slots, `[ndwuTableToolbarStart]` and `[ndwuTableToolbarEnd]`; `size` scales spacing |
| `NdwuPaginatorComponent`     | `<ndwu-paginator>`       | `length`, `pageSizeOptions` inputs; `pageIndex`, `pageSize` models; emits `page`    |
| `NdwuTableSkeletonComponent` | `<ndwu-table-skeleton>`  | Loading placeholder: `rows`, `columns`, `columnWidths`                              |

### Translations

`NdwuTableTranslationTexts` groups every built-in string by part: `paginator`,
`skeleton`, `columnPin`, `rowDragHandle`, `columnResize`. Each part takes its
group through its own input (`paginatorTexts`, `skeletonTexts`, `pinTexts`,
`dragTexts`, `resizeTexts`). A value is literal text or a translation key, and
missing fields fall back to English.

## Who Owns What

| Concern          | Reported by                        | Owned by the host as                        | Applied by                         |
|------------------|------------------------------------|---------------------------------------------|------------------------------------|
| Sort             | `[(ndwuSort)]`                     | `dataSource.sort`                           | `NdwuTableDataSource.sorted`       |
| Filter           | host input (e.g. toolbar search)   | `dataSource.filter`                         | `NdwuTableDataSource.filtered`     |
| Page             | paginator `pageIndex` / `pageSize` | `dataSource.pageIndex` / `pageSize`         | `NdwuTableDataSource.page`         |
| Pinned column    | `pinnedChange`                     | a signal bound to `[sticky]` on the column  | CDK sticky styler                  |
| Column width     | `ndwuColumnResized`                | optional; the directive already set the width | `NdwuColumnResizeDirective`      |
| Row order        | `ndwuRowDrop`                      | `dataSource.moveRow()` or `moveItemInArray` | the data source re-emits           |
| Selection        | host checkboxes                    | a `Set` of ids                              | `[class.ndwu-row--selected]`       |
| Expanded rows    | host button in a cell              | a `Set` of ids                              | a second `*ndwuRowDef` with `when` |
| Loading          | host                               | a boolean                                   | `@if` swaps table and skeleton     |

## How the Pieces Connect

The device table in the playground uses every part. Shortened:

```html
<ndwu-table-toolbar size="L">                         /* <- Actions above the table */
  <button ndwuTableToolbarStart ndwu-button ...></button>
  <input ndwuTableToolbarStart (input)="onFilterChange($event)" />  /* <- sets dataSource.filter */
</ndwu-table-toolbar>

@if (loading()) {
  <ndwu-table-skeleton [rows]="pageSize()" [columns]="7" [columnWidths]="widths" />
} @else {
  <ndwu-table
    [dataSource]="dataSource"                         /* <- NdwuTableDataSource or a plain array */
    [trackBy]="trackById"
    [multiTemplateDataRows]="true"                    /* <- needed for the detail row */
    [(ndwuSort)]="dataSource.sort"                    /* <- sort state, written back to the data source */
    (ndwuSortChange)="dataSource.pageIndex.set(0)"    /* <- optional: back to the first page */
  >
    <ng-container ndwuColumnDef="name" [sticky]="namePinned()">  /* <- pin applied here */
      <th ndwuHeaderCell *ndwuHeaderCellDef
          ndwuSortHeader="name"                       /* <- sort button inside the cell */
          ndwuColumnResize>                           /* <- adds the resize grip */
        Name
        <button ndwuColumnPin                         /* <- projected next to the sort button */
                [pinned]="namePinned()"
                (pinnedChange)="namePinned.set($event)"></button>
      </th>
      <td ndwuCell *ndwuCellDef="let row">{{ row.name }}</td>
    </ng-container>

    <ng-container ndwuColumnDef="expandedDetail">
      <td ndwuCell *ndwuCellDef="let row" [attr.colspan]="7">...</td>
    </ng-container>

    <ndwu-header-row *ndwuHeaderRowDef="displayedColumns; sticky: true" />
    <ndwu-row *ndwuRowDef="let row; columns: displayedColumns"
              [class.ndwu-row--selected]="isSelected(row)" />
    <ndwu-row *ndwuRowDef="let row; columns: ['expandedDetail']; when: isDetailRow"
              class="ndwu-row--detail" [class.detail-hidden]="!isExpanded(row.id)" />

    <ng-template ndwuNoDataRow>
      <td [attr.colspan]="7"><ndwu-empty-state ... /></td>
    </ng-template>
  </ndwu-table>
}

<ndwu-paginator
  [length]="dataSource.length()"                      /* <- row count after filtering */
  [(pageSize)]="dataSource.pageSize"
  [(pageIndex)]="dataSource.pageIndex"
/>
```

To sort elsewhere, e.g. on the server, bind one way and handle the change:
`[ndwuSort]="sort()" (ndwuSortChange)="loadPage($event)"`.

Row drag uses a separate table, because it cannot be combined with sort:

```html
<ndwu-table [dataSource]="rows()" ndwuRowDrag (ndwuRowDrop)="onRowDrop($event)">
  <ng-container ndwuColumnDef="drag">
    <th ndwuHeaderCell *ndwuHeaderCellDef></th>
    <td ndwuCell *ndwuCellDef="let row"><button ndwuRowDragHandle></button></td>
  </ng-container>
  ...
  <ndwu-row *ndwuRowDef="let row; columns: displayedColumns" [ndwuRowDraggable]="row" />
</ndwu-table>
```

```typescript
protected onRowDrop(event: CdkDragDrop<unknown>): void {
  this.rows.update(rows => {
    const next = [...rows];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    return next;
  });
  // With NdwuTableDataSource: this.dataSource.moveRow(event.previousIndex, event.currentIndex);
}
```

## Runtime Flows

### Sorting

```
User clicks a sortable header
  │
  V
NdwuSortHeaderComponent.onSort()
  │  (injects NdwuSortDirective from the table element)
  V
NdwuSortDirective.sort(id)
  │  same column: asc → desc → '' (cleared); other column: asc
  │  sets the ndwuSort model, which emits ndwuSortChange({active, direction})
  V
[(ndwuSort)] writes it to dataSource.sort
  │
  V
NdwuTableDataSource: sorted → page recompute
  │  sortAccessor reads each value; null, undefined, NaN and invalid dates go last
  │  sortComparator (default: Date by time, numbers, then numeric string collation)
  │  returns ascending order; the direction is applied once, and the sort is stable
  │  connect() observable emits the new page
  V
CdkTable renders the rows; sort header reads the directive → icon + aria-sort
```

### Filtering and Paging

```
Host sets dataSource.filter / paginator writes pageIndex, pageSize
  │
  V
filtered: filter is trimmed and lowercased, then passed to filterPredicate
  │       (default: any field's String() value contains the filter)
  V
sorted → page: slice of pageSize rows; pageIndex is clamped to the last page
  │
  V
length (after filtering) → paginator [length] → range label and button state
```

A page size of `0` turns paging off. Both the data source and the paginator clamp
the index, so deleting the last rows of the last page shows the page before it.

### Pinning a Column

```
User clicks the pin button in a header
  │
  V
NdwuColumnPinComponent.toggle()
  │  stopPropagation: the click must not reach the sort button
  │  emits pinnedChange(!pinned)
  V
Host: namePinned.set(value) → [sticky] on NdwuColumnDefDirective
  │
  V
CdkTable sticky styler adds `ndwu-table-sticky` and the left offset to the cells
```

### Resizing a Column

```
ngAfterViewInit: NdwuColumnResizeDirective creates the grip and appends it to the <th>
  │
User drags the grip (pointerdown → pointer capture)
  │
  V
first resize: every header cell is frozen at its rendered px width, <table> width = their sum
  │
  V
pointermove: native listener, outside change detection → sets <th> width
  │
pointerup / pointercancel → emits ndwuColumnResized(width)
```

The grip is in the Tab order. With it focused, Left/Right change the width by
8px (40px with Shift), Home and End jump to the minimum and maximum. The
keyboard maximum is 1000px, or the current width if the column is already
wider; a pointer drag has no maximum. Each key press that changes the width
emits `ndwuColumnResized`.

The table is `width: 100%` with `table-layout: fixed`, so the browser spreads
spare width over all columns. The first resize (a drag, or a key that changes
the width; Tab does not) freezes every header cell at its rendered px width and
gives the `<table>` that sum as its width. Later changes are exact, and a
narrower table leaves space on the right. Each change sets the `<th>` width and
the table width again; when the header row is re-created on a locked table, the
new cells are frozen and the table width is synced. Only the resized cell's
header row is locked; fixed layout reads the first row, so a table with group
header rows is not covered.

The directive sets all header widths and the table width. A host that keeps a
width across renders stores the emitted value and binds it back; a host that
restores one stored width should restore it before the first resize.

### Reordering Rows

```
User drags the handle (CdkDragHandle) → CdkDrag on the row → CdkDropList on the table
  │
  V
ndwuRowDrop(CdkDragDrop) → host reorders its data
  │
  V
The data source emits the new order; CdkTable moves the rows
```

The kit never reorders data. Indices are page-relative, which is what
`dataSource.moveRow()` expects.

The keyboard path ends in the same `ndwuRowDrop`, so the host needs no extra code:

```
User focuses the handle and presses Space or Enter → row grabbed (aria-pressed, row highlighted)
  │
  V
ArrowUp / ArrowDown / Home / End → ndwuRowDrop(CdkDragDrop) with a KeyboardEvent as `event`
  │  host reorders its data; after the render the handle gets focus back
  V
Space / Enter / Tab away → dropped; Escape → moved back to where it was grabbed
```

Each arrow, Home or End press emits its own `ndwuRowDrop`, and Escape emits one
more to move the row back. A host that saves the order on every drop sends one
request per step.

Every step is announced through the CDK `LiveAnnouncer` with the row's position.
Rows must keep their identity across the reorder (`trackBy` or the same
objects), so the focused handle survives the move.

## Drawbacks

### Template Boilerplate

A consumer imports every directive they use and writes a column block for each
column. The device table imports 18 table symbols. This is the cost of keeping
the template in the consumer's hands.

### Dependence on CDK Internals

The structure layer relies on CDK members that are not public API:

| Member                              | Used for                                                    |
|-------------------------------------|-------------------------------------------------------------|
| `_DisposeViewRepeaterStrategy`      | Same row rendering strategy as `MatTable`                   |
| `stickyCssClass`, `needsPositionStickyOnElement` | Kit class name; `position: sticky` comes from CSS |
| `super.ngOnChanges({})` in row defs | Primes the columns differ, which signal inputs never trigger |

A CDK upgrade can break these. The same members are used by Angular Material,
which lowers the risk.

### Signal Inputs Over Decorator Inputs

The CDK reads decorator inputs (`name`, `columns`, `sticky`, `when`). The kit
declares signal inputs and writes them through in `ngOnChanges`. Inputs that
still come from the CDK (`[sticky]` on a column def, `trackBy`, `dataSource`)
are decorator inputs, so the API mixes both kinds.

### Rendering

Rows and the table are not `OnPush`: the CDK stamps rows imperatively, and
`OnPush` would block their cells. Table styles are unencapsulated, because rows
and cells come from the consumer's template.

### Feature Limits

- Sort and row drag are exclusive. `ndwuRowDrag` disables itself and warns in dev mode.
- Detail rows have no dedicated API; they use `multiTemplateDataRows` and a `when` row def.

## Rationale and Alternatives

| Alternative                               | Why not                                                                   |
|-------------------------------------------|---------------------------------------------------------------------------|
| Angular Material `MatTable`               | Pulls in Material theming; our markup and tokens would fight it           |
| A table built from scratch                | Re-implements row diffing, sticky offsets and multi-template rows         |
| Config-driven table (`[columns]` objects) | Cells need arbitrary content (checkboxes, toggles, badges, menus); a config ends up as templates anyway |
| Features that own state (e.g. sort inside the table) | Breaks server-side sorting and paging; the host must own the data |
| Wrapping CDK directives by composition (`hostDirectives`) | The CDK looks up `CdkColumnDef`, `CdkRowDef` and others by class token; subclassing plus `useExisting` is how it finds ours |

Without this table, each screen builds its own `<table>` with its own sort,
paging and sticky logic, and its own accessibility gaps.

# Unresolved questions

- Should the kit export one array of all table imports to cut the boilerplate?
- Should the kit add default row defs from a `columns` input, or a detail-row slot,
  if screens keep repeating the same markup? (Declined for now in PR #8.)
- Should column widths and pins be persisted by the kit, or stay the host's job?
- The footer row is exported but has no playground demo.

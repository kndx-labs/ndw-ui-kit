# 009 Table row density

- Status: Accepted
- Date: 2026-09-21

## Context and Problem Statement

`NdwuTableComponent` renders every row at a single height: `$row-height: 48px`
in `table/ndwu-table.tokens.scss`, applied to `.ndwu-header-cell`, `.ndwu-cell`
and the toolbar's `min-height`. The value is not configurable.

Most other kit components do participate in a shared size system:
`NdwuSizeDirective` is attached as a host directive (aliased to a `size` input),
its `effectiveSize()` is provided through `NDWU_SIZE_TOKEN` so nested controls
inherit it, and the size lands on the host as a `--S`/`--L`/`--XL`/`--XXL`
modifier class. `NdwuCardComponent` is the reference implementation.

The table not participating is a real inconsistency, so the question is whether
to wire it in now.

## Considered Options

1. **Add a `size` input now, following the card.**
   Rejected: there is no table specification in `md_design/`, so the per-size
   row heights would be invented. The kit's existing scale is S 24, L 32,
   XL 44, XXL 56 (button, form field) — 48px, the height the table is drawn at
   today, is not on it. Picking a mapping now means either silently moving the
   default row off the current design or publishing three heights nobody has
   drawn, both of which are hard to walk back once `size` is public API.

2. **Expose the height as a `--ndwu-table-row-height` custom property.**
   Rejected: it buys nothing here. `ndwu-table.component.scss` is deliberately
   unencapsulated (rows and cells are consumer elements the CDK instantiates),
   so a consumer who needs a denser table can already override `.ndwu-cell` /
   `.ndwu-header-cell` heights from their own stylesheet. Adding a second,
   equally unsupported mechanism only makes the eventual `size` input ambiguous.

3. **Keep one density, record the decision, defer the input to the spec.**
   Accepted.

## Decision Outcome

The table stays at a single 48px density. `size` is not part of its public API
until a table design specification defines the per-size row heights.

When that specification arrives, the table follows the card exactly:
`NdwuSizeDirective` as a host directive aliased to `size`, `NDWU_SIZE_TOKEN`
provided from `effectiveSize()` so in-cell controls inherit the density, and a
`ndwu-table--<size>` modifier on the host driving the cell heights.

## Consequences

### Pros:

- No guessed design values enter the public API.
- The single metric stays in one place (`$row-height`), so adopting the size
  system later is a contained change.
- Consumers needing a denser table today can still override the cell heights.

### Cons:

- The table remains the odd one out among sized components until the spec lands.
- Consumers who override cell heights depend on class names rather than on a
  supported input, and will have to migrate when `size` ships.

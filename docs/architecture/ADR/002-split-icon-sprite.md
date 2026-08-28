# 002 Split Icon Sprite

- Status: Accepted
- Date: 2026-05-12

## Context and Problem Statement

Previously, the library shipped a single SVG sprite (`ndw-ui-kit.sprite.svg`) that contained
every icon from the design system. This forced all consuming applications to include the full
icon catalog as a static asset, regardless of how many icons they actually used.

The library itself only uses a small, well-defined set of icons internally — for example,
`eye-on` / `eye-off` for password input fields, or `error_XS` for form validation errors.
Most of the remaining hundreds of icons exist purely for application-level use.

Shipping one monolithic sprite is problematic for some consumers of the library
(namely, `ndw3` and `ndw4`), because for of the overall size limitation: the full
sprite is ~300 kB.

## Considered Options

1. **Keep a single sprite (status quo).**
   Simple to maintain, but every consumer must ship the entire icon catalog regardless of usage.

2. **Split the sprite into a "core" bundle (library-internal icons) and an "extra" bundle
   (all remaining icons), with the extra bundle being opt-in.**
   Reduces the mandatory asset size for consumers; those who need the full catalog can opt in
   with a single provider call. The split boundary is derived automatically from static analysis
   of `src/lib` source code, supplemented by a small hand-maintained allowlist for
   fallback/compatibility icons.

3. **Allow consumers to assemble a fully custom sprite from individual icons.**
   Maximum flexibility, but significantly more complex to implement and consume.

## Decision Outcome

Option 2 was chosen.

Two SVG sprite files are now generated:

- **`ndw-ui-kit.sprite.svg`** (core) — contains only the icons used by the library's own
  components. This file is required and must be included in the consumer application's assets.
- **`ndw-ui-kit.extra.sprite.svg`** (extra) — contains all remaining icons from the design
  system. This file is optional; include it when the application needs to display icons beyond
  the core set.

The boundary between the two sprites is determined by the `BASE_ICON_NAME` list, which is
generated automatically by `scripts/collect-base-icon-usage.ts`. That script performs static
analysis of all `*.ts` and `*.html` files under `src/lib` to find every `ICON_NAME.*` member
access and every string literal typed as `IconName`, then unions the result with the small
manual allowlist in `src/lib/icon-names.base.manual.ts` (currently just the `warning_S`
fallback icon).

**Runtime configuration** is handled through the `NDWU_ICON_SPRITE_CONFIG` injection token
(introduced in `src/lib/core/tokens/icon-sprite-config.token.ts`). By default, `<ndwu-icon>`
loads symbols only from the core sprite. Consumers who need the full catalog call
`provideAllNdwUiKitIcons()` in their application providers, which adds the extra sprite source
to the token's configuration.

The option to customize the set of available icons for a particular library consumer
remains a potential future direction.

## Consequences

### Pros:

- The mandatory asset footprint for every consumer application is significantly smaller by
  default, as only icons used internally by the library are bundled into the required sprite.
- The separation between "library needs these" and "these are available to you" is made explicit
  and codified in generated artifacts (`icon-names.base.ts`, `EXTRA_ICON_NAME`).
- Static analysis (`collect-base-icon-usage.ts`) keeps the split accurate.
- Opting into the full icon catalog is quite simple (`provideAllNdwUiKitIcons()`).

### Cons:

- Consumers who need icons outside the core set must remember to both add the extra asset glob
  to `angular.json` **and** call `provideAllNdwUiKitIcons()`. Forgetting either step results in
  icons silently rendering as the fallback icon (`warning_S`).
- The extra sprite is still an all-or-nothing chunk; there is no mechanism yet for consumers to
  include only the specific icons their application uses. This is a known limitation.
- The build pipeline gained additional complexity: a new static-analysis pass
  (`collect-base-icon-usage`) must run before sprite generation, and the sprite generator now
  produces two output files instead of one.


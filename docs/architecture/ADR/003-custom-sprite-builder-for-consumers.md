# 003 Custom Sprite Builder for Consumers

- Status: Accepted
- Date: 2026-05-15

## Context and Problem Statement

[ADR #002](./002-split-icon-sprite.md) introduced two SVG sprites:
a small mandatory **core** sprite (icons used by the library itself)
and a larger optional **extra** sprite (~330 icons available to consumers).
Consumers opt into the extra sprite by calling `provideAllNdwUiKitIcons()`.

However, a consumer that uses, say, 10 icons from the extra catalog still
has to ship all ~330 icons to their end users. This ADR proposes a solution
to allow consumers to ship only the icons they actually use,
without losing the runtime validation and fallback-icon features of `<ndwu-icon>`.

## Considered Options

### Option 1 &mdash; Status quo (continue shipping only core + full extra)

No new tooling; consumers who care about size are expected to strip the extra sprite via a
bundler plugin or similar post-processing.

> Context: no off-the-shelf Angular/webpack plugin handles SVG sprite pruning;
> the burden falls entirely on the consumer and the validation mechanism
> in `<ndwu-icon>` cannot be leveraged.

### Option 2 &mdash; Separate assets npm package with individual icon files

Publish every icon as a standalone SVG file in a separate npm package (`@ndw-ui-kit/icons`).
Consumers import only what they need; a build plugin concatenates them into a single runtime asset.

This solution requires either a build plugin (coupling to Webpack/Vite/esbuild)
or manual file assembly. Increases publishing complexity. Kept as a possible future direction.

### Option 3 &mdash; Consumer CLI to generate a custom sprite from a declarative config

Ship a CLI binary (`ndw-ui-kit-build-sprite`) inside the published npm package.
The consumer declares which extra-icon names they need in a config file;
the CLI validates the names and generates a single custom sprite SVG.
The consumer registers the sprite via a new Angular provider (`provideNdwUiKitCustomIcons`),
passing the sprite path and the same icon-name list.

## Decision Outcome

Option 3 was chosen. The feature consists of four cooperating parts:

### 1. Shared sprite-builder utility (`scripts/utils/sprite-builder.ts`)

The SVG assembly logic that was previously embedded in `generate-sprite.ts` has been extracted
into three reusable functions exported from `sprite-builder.ts`:

- `createSpriter(outputDir, fileName)` &mdash; creates a configured `SVGSpriter` instance.
- `addFileToSpriter(spriter, sourceDir, file)` &mdash; adds a single SVG to the spriter,
  normalising dimensions automatically.
- `compileSpriter(spriter)` &mdash; compiles the spriter and writes the output file.

Both the internal `generate-sprite.ts` pipeline and the shipped CLI script share this implementation.

### 2. Consumer CLI (`scripts/build-custom-sprite.ts` -> published as `ndw-ui-kit-build-sprite`)

```shell
npx ndw-ui-kit-build-sprite --config src/my-icons.json --out src/assets/my-custom.sprite.svg
```

The CLI script:
- Reads a JSON config (`{ "icons": ["wifi_signal_1_L", "usb_L", ...] }`).
- Validates every name against the SVG files bundled in the package; exits non-zero with an
  actionable error for any unknown name.
- Generates a single sprite SVG containing only the requested icons.

The CLI is compiled to `dist/ndw-ui-kit/tools/build-custom-sprite.mjs` via `esbuild`
as part of the publishable build (`emit-custom-sprite-cli` script). Raw source SVGs
are copied to `dist/ndw-ui-kit/assets/sprite-icons/` by the
`copy-custom-sprite-sources` script.

### 3. Provider factory (`provideNdwUiKitCustomIcons`)

A new provider factory added to `src/lib/core/tokens/icon-sprite-config.token.ts`:

```typescript
provideNdwUiKitCustomIcons({
  path: 'assets/my-custom.sprite.svg',
  iconNames: ['wifi_signal_1_L', 'usb_L'],
})
```

The factory always includes the core sprite source and appends the consumer's custom source,
keeping the existing fallback-icon behavior intact. The `iconNames` field accepts
`readonly IconName[]` so consumers can pass a statically-typed array directly from their config.

### 4. Packaging

- `package.json` `bin` entry: `"ndw-ui-kit-build-sprite": "./tools/build-custom-sprite.mjs"`
- Published package structure:
  ```
  dist/ndw-ui-kit/
    tools/build-custom-sprite.mjs   <- CLI binary
    assets/sprite-icons/*.svg       <- source SVGs for CLI to read
  ```
- New root `package.json` script `build:to-publish` chains the Angular build, CLI transpilation
  and source-copy steps.
- `svg-sprite` is added as a runtime dependency of the published package (previously dev-only)
  so the CLI can use it after `npm install`.

## Consequences

### Pros:

- Consumers can ship only the subset of extra icons that their application actually uses; the
  payload reduction can be significant (e.g., 10 icons vs. ~330).
- Runtime validation in `<ndwu-icon>` continues to work correctly because the consumer registers
  the exact `iconNames` they included in their custom sprite.
- (Almost) zero new dependencies: the CLI is a plain Node.js binary that relies on `svg-sprite`;
  It should be executed manually by the developers of the consumer app to produce a static SVG file.
- The CLI script shows error message for any unknown icon name, preventing silent misconfigurations.
- The shared `sprite-builder.ts` utility consolidates the SVG assembly logic that was previously
  duplicated across internal scripts.

### Cons:

- Consumers must run the CLI script and commit (or regenerate on each build) the sprite file;
  this adds a step compared to simply enabling `provideAllNdwUiKitIcons()`.
- The current sprite configuration format is JSON-only (no autocomplete/typo checks from IDE).


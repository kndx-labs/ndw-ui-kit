# NDW UI Kit Repository

This README is for maintainers of this repository.

For the library usage examples, theming, icons, localization, etc.,
see [src/lib/README.md](src/lib/README.md) (published with the package).

## What this repository contains

`ndw-ui-kit` is an Angular 20 library plus internal tooling for:

- Component code (`src/lib`)
- Playground app (`src/playground`)
- Token / icon / pictogram preprocessing and codegen (`scripts`)
- Architecture and process documentation (`docs`)

## Repository structure (high level)

```text
src/
  lib/            # publishable library source
  playground/     # local playground app for manual verification
scripts/          # build/codegen/publish tooling (tsx scripts)
docs/
  architecture/
    ADR/          # accepted/proposed architecture decisions
    RFC/          # proposal process
```

## Source of truth

- Package-facing documentation: `src/lib/README.md`
- Architecture decisions: `docs/architecture/ADR/*.md`
- Repository workflow (this file): `README.md`

## Local development

### Install

```shell
yarn install
```

+

```shell
# setup Husky hooks
yarn prepare
```

### Build library artifacts

```shell
yarn run build
```

This runs icon/pictogram preprocessing + Angular library build.

### Run playground

```shell
yarn run start
```

Optional playground variants:

```shell
yarn run playground:ngx-translate
yarn run playground:no-l10n
```

### Linting and formatting

This repository uses three separate code-quality tools:

- `eslint` for TS code + Angular component templates
- `stylelint` for SCSS
- `dprint` for TS/JS formatting

Configuration files:

- `eslint.config.js` &mdash; flat ESLint config
  with `typescript-eslint`, `angular-eslint`, etc.
- `.stylelintrc.js` &mdash; SCSS/style rules based on `stylelint-config-standard-scss`
  plus ordering and browser-compatibility checks
- `dprint.json` &mdash; formatter rules such as indentation, line width, etc.

Relevant scripts:

- `yarn run fmt` &mdash; formats `src/**/*.ts` and `scripts/**/*.ts` with `dprint`
- `yarn run lint:ts-src` &mdash; lints `src/**/*.ts` and `src/**/*.component.html` with ESLint
- `yarn run lint:ts-scripts` &mdash; lints `scripts/**/*.ts` with ESLint
- `yarn run lint:ts` &mdash; runs both ESLint commands in parallel via `run-p`
- `yarn run lint:styles` &mdash; lints `src/**/*.scss` with Stylelint
- `yarn run lint-lib` &mdash; library-focused check (`lint:ts-src` + `lint:styles`)
- `yarn run lint-all` &mdash; full repository lint for TypeScript + SCSS
- `yarn run lint-all-fix` &mdash; runs `fmt`, then ESLint `--fix`, then Stylelint `--fix`

Notes:

- ESLint is type-aware through `typescript-eslint` `projectService`
  and also lints Angular inline templates via the Angular ESLint processor.
- `scripts/**/*.ts` use a dedicated ESLint override with Node globals.
- ESLint caching is enabled at the script level via separate cache files
  so the source-tree and tooling-tree lint jobs can run independently.
- Stylelint has relaxed overrides for `src/playground/**/*.scss`,
  where browser-compatibility and ordering checks are intentionally less strict.

## Internal agreements

### 1) Generated icon artifacts are not hand-edited

The source SVG assets come from Figma. To update icons and pictograms from the design file:

```shell
yarn sync-figma-icons
```

> [!NOTE]
> Make sure to set your Figma API key in the `.env` file before running this command.
> Copy `.env.example` to `.env` and specify your Figma personal access token as FIGMA_API_KEY there.


This runs `scripts/figma/sync-icons.ts`, which:

- connects to the Figma API and downloads all icons and pictograms from the configured nodes
- writes them to `scripts/data/icons/` with underscore-separated filenames (`{name}_{size}.svg` for icons, `pictogram_{name}_{size}.svg` for pictograms)
- removes orphaned SVG files that no longer exist in Figma

After syncing, build the generated artifacts:

```shell
yarn run prepare-icons
yarn run prepare-pictograms
```

The following are generated from assets under `scripts/data` and source usage analysis:

- `src/lib/icon-names.ts`
- `src/lib/pictogram-names.ts`
- sprite files under `src/lib/assets/`

Use scripts, not manual edits:

```shell
yarn run prepare-icons
yarn run prepare-pictograms
```

### 2) Icon sprite model is split (core + extra)

As defined in ADR 002:

- Core sprite: required for library internals
- Extra sprite: optional full catalog for consumers

As defined in ADR 003:

- A consumer CLI (`ndw-ui-kit-build-sprite`) is published for custom subsets
- Build emits/copies CLI and SVG sources into `dist/ndw-ui-kit/tools` and `dist/ndw-ui-kit/assets/sprite-icons`

### 3) Publishing requires artifact verification

Before publishing, required dist artifacts are validated by `scripts/verify-publish-artifacts.ts`.

Publishing path:

1. `yarn run build:to-publish`
2. `yarn run publish:lib`

`publish:lib` executes `scripts/publish.ts`, which currently runs:

- `yarn run verify:publish-artifacts`
- `npm publish dist/ndw-ui-kit`

> [!IMPORTANT]
> Important: this is a real publish command (no `--dry-run` in current script).

### 4) Keep root README and library README separated

- `README.md` (root): internal repository workflows, agreements, release process
- `src/lib/README.md`: package-consumer docs and examples

When changing public behavior, update `src/lib/README.md` first, then update this file only if repo workflow changed.

## Common scripts

```shell
yarn run build
yarn run test
yarn run fmt
yarn run lint:ts
yarn run lint:styles
yarn run lint-lib
yarn run lint-all
yarn run lint-all-fix
```

Icon/sprite pipeline:

```shell
yarn sync-figma-icons
yarn run check-base-icons
yarn run build-custom-sprite
yarn run emit-custom-sprite-cli
yarn run copy-custom-sprite-sources
yarn run verify:publish-artifacts
```

### Failure notifications

If preprocessing fails on any SVG files, you can get a summary posted to an
incoming webhook (plain-text payload, compatible with most chat webhooks):

```shell
NOTIFY_WEBHOOK_URL=https://your-webhook.example/endpoint yarn run prepare-icons --notify
NOTIFY_WEBHOOK_URL=https://your-webhook.example/endpoint yarn run prepare-pictograms --notify
```

The webhook URL is read from the `NOTIFY_WEBHOOK_URL` environment variable.
Set it in your shell or in `.github/workflows/*.yml` as a secret (`${{ secrets.NOTIFY_WEBHOOK_URL }}`).

A `.env` file in `scripts/` is also supported for local development.

Publish pipeline:

```shell
yarn run build:to-publish
yarn run publish:lib
```

## Notes for contributors

- Prefer adding/updating ADRs for non-trivial architecture changes.
- If you modify build scripts in `scripts/`, validate the publish path with:

```shell
yarn run build:to-publish
yarn run verify:publish-artifacts
```

## Component tokens

This section documents the repository-level agreement for component theming tokens.

### How tokens are defined in the library

1. Create a component token file next to the component, usually `*.tokens.scss`.
2. Export a flat SCSS map named `$ndwu-<component>-tokens`.
3. Use theme-aware values from `src/lib/styles/colors` (instead of hardcoded colors).
4. Consume emitted CSS vars in component styles via `var(--ndwu-<token-key>)`.

Example from the current codebase:

- Token map: `src/lib/core/components/card/ndwu-card.tokens.scss`
- Usage in component styles: `src/lib/core/components/card/ndwu-card.component.scss`

### How tokens are registered and emitted

Register each component token map in `src/lib/styles/themes.scss`:

```scss
@use 'core/components/card/ndwu-card.tokens' as ndwu-card-tokens;

$component-tokens: (
  'ndwu-card': ndwu-card-tokens.$ndwu-card-tokens,
);
```

Emission is handled by `src/lib/styles/themes/_theme-utils.scss`:

- `emit-theme-vars` converts token map entries to CSS vars with `--ndwu-` prefix.
- `emit-token-groups` applies all registered token groups (component and utility maps).

Variables are emitted for all supported selectors in `src/lib/styles/themes.scss`:

- `:root`
- `:root.dark`
- `.ndwu-theme-light`
- `.ndwu-theme-dark`

### Naming agreement

- SCSS token key: `card-border-color`
- Emitted CSS var: `--ndwu-card-border-color`
- In component SCSS: `border-color: var(--ndwu-card-border-color);`

The conversion rule is implemented in `src/playground/app/utils/css.ts` (`tokenKeyToCssVar`).

### How playground sandboxes use tokens

Playground sandboxes use token overrides to demonstrate customization in isolation.

Core pattern (example: badge sandbox):

- UI controls keep token values in a form (`sandboxTokens`).
- `SandboxBaseComponent` converts form values into an `ngStyle` map of CSS vars.
- Preview surface applies `[ngStyle]="sandboxTokenStyles()"` and a theme class.
- Component SCSS uses fallback chains such as:
  - `var(--ndwu-badge-override-bg, var(--ndwu-badge-bg))`

Reference files:

- Base token-override flow: `src/playground/app/lib-component-showcase/sandbox-base.component.ts`
- Badge sandbox wiring: `src/playground/app/lib-component-showcase/badge/sandbox/badge-sandbox.component.ts`
- Badge preview styles with fallbacks: `src/playground/app/lib-component-showcase/badge/sandbox/badge-sandbox.component.scss`
- Token list UI: `src/playground/app/components/token-list/token-list.component.ts`

### When adding a new tokenized component

Use this checklist:

1. Add `<component>.tokens.scss` with `$ndwu-<component>-tokens`.
2. Use `var(--ndwu-...)` in component styles.
3. Register the token map in `src/lib/styles/themes.scss`.
4. (Optional but recommended) Add or extend a playground sandbox with token controls.
5. Keep package-facing docs in `src/lib/README.md` in sync if public behavior changes.

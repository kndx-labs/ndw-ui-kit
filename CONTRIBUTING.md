# Contributing to NDW UI Kit

Thanks for helping improve `@ndw-ui-kit/core`. This guide covers how to set up
the repository, verify a change, and get it reviewed and merged.

Related documents:

- [README.md](README.md) &mdash; repository workflows, icon pipeline, publishing, component tokens
- [src/lib/README.md](src/lib/README.md) &mdash; package documentation for library consumers
- [docs/codestyle/](docs/codestyle/CODESTYLE.md) &mdash; code style, naming and SCSS conventions
- [docs/architecture/](docs/architecture/) &mdash; ADRs and RFCs

## Table of contents

- [Before you start](#before-you-start)
- [Environment setup](#environment-setup)
- [Running the playground](#running-the-playground)
- [Running tests](#running-tests)
- [Code requirements](#code-requirements)
- [Icons and pictograms](#icons-and-pictograms)
- [Commits](#commits)
- [Pull requests](#pull-requests)
- [Review process](#review-process)

## Before you start

- Every change needs a Jira issue in the `NDWU` project. The issue key goes into
  the branch name, the commit messages and the pull request title.
- For a non-trivial architecture change, write an RFC first
  ([docs/architecture/RFC/README.md](docs/architecture/RFC/README.md)),
  then record the accepted decision as an ADR in `docs/architecture/ADR/`.
- If the change affects public behavior, plan to update
  [src/lib/README.md](src/lib/README.md) in the same pull request.
- Report bugs and ask questions in the `NDWU` Jira project or ask a maintainer.
- Contributions are licensed under the [MIT License](LICENSE).

## Environment setup

### Prerequisites

| Tool    | Version                                                        |
| ------- | -------------------------------------------------------------- |
| Node.js | 22 LTS (the version used by the GitHub sync workflows)         |
| Yarn    | 4.4.1, pinned in `package.json` `packageManager`, via Corepack |
| Git     | any recent version                                             |

Enable Corepack once so that `yarn` resolves to the pinned version:

```shell
corepack enable
```

### Install

```shell
git clone git@github.com:kndx-labs/ndw-ui-kit.git
cd ndw-ui-kit
yarn install
```

### Environment variables

Only the Figma icon sync and the failure notifications need environment variables.
Scripts read them from `scripts/.env`:

```shell
cp scripts/.env.example scripts/.env
```

| Variable                   | Needed for                                                         |
| -------------------------- | ------------------------------------------------------------------ |
| `FIGMA_API_KEY`            | `yarn sync-figma-icons` (your Figma personal access token)         |
| `FIGMA_FILE_KEY`           | `yarn sync-figma-icons`                                            |
| `FIGMA_ICONS_NODE_ID`      | `yarn sync-figma-icons`                                            |
| `FIGMA_PICTOGRAMS_NODE_ID` | `yarn sync-figma-icons`                                            |
| `FIGMA_ICONS_DATA_DIR`     | optional, defaults to `scripts/data/icons`                         |
| `NOTIFY_WEBHOOK_URL`       | optional, `prepare-icons --notify` / `prepare-pictograms --notify` |

Ask a maintainer for the Figma file key and node IDs. Never commit `scripts/.env`.

## Running the playground

The playground (`src/playground`) is the app for checking components by hand.

```shell
yarn start
```

It serves on `http://localhost:4200`. The localization setup depends on the script:

| Command                         | What it runs                                             |
| ------------------------------- | -------------------------------------------------------- |
| `yarn start`                    | default playground, uses the `ngx-translate` adapter     |
| `yarn playground:ngx-translate` | `ngx-translate` build configuration                      |
| `yarn playground:no-l10n`       | `no-l10n` configuration, without a localization provider |

### Adding or changing a showcase

Each component has a showcase in
`src/playground/app/lib-component-showcase/<component>/`
(widgets and examples live in `lib-widget-showcase/` and `lib-example-showcase/`):

- `overview/` &mdash; usage examples
- `sandbox/` &mdash; interactive controls and token overrides
  (see [Component tokens](README.md#component-tokens) in the README)
- `localization/<component>-showcase.json` &mdash; English source strings
- `localization/de/<component>-showcase.json` &mdash; German translations

`yarn test` and every playground script except `yarn playground:no-l10n` merge
the localization files into `src/playground/assets/i18n/` through
`scripts/merge-playground-i18n.mjs`.
Edit the per-showcase files, not the merged output.

A new component should come with a playground showcase. Register it in
`lib-component-showcase/showcase-registry.ts` (`widget-registry.ts` and
`example-registry.ts` for widgets and examples).

## Running tests

Unit tests run on Vitest through the Angular unit-test builder:

```shell
yarn test
```

Spec files sit next to the code they test as `*.spec.ts` under `src/lib/`.

Before you open a pull request, also check that the library builds:

```shell
yarn build
```

If you changed anything in `scripts/`, validate the publish path as well:

```shell
yarn build:to-publish
```

## Code requirements

There is no CI check on pull requests and there are no pre-commit hooks,
so run the checks yourself before pushing.

| Tool      | Checks                                         | Config             | Command            |
| --------- | ---------------------------------------------- | ------------------ | ------------------ |
| dprint    | formatting of `src/**/*.ts`, `scripts/**/*.ts` | `dprint.json`      | `yarn fmt`         |
| ESLint    | TypeScript and component templates             | `eslint.config.js` | `yarn lint:ts`     |
| Stylelint | SCSS                                           | `.stylelintrc.js`  | `yarn lint:styles` |

Run everything at once:

```shell
yarn lint-all        # check
yarn lint-all-fix    # Stylelint --fix, then dprint, then ESLint --fix
```

Rules:

- A pull request must not add new ESLint or Stylelint warnings.
- `yarn fmt` and `yarn lint-all-fix` touch the whole tree. Commit only the files
  that belong to your change.
- Follow [CODESTYLE.md](docs/codestyle/CODESTYLE.md),
  [NAMING.md](docs/codestyle/NAMING.md) and [CSS.md](docs/codestyle/CSS.md).
  Highlights:
  - exported symbols are prefixed with `Ndwu`, `NDWU_` or `ndwu`
  - components use BEM class names with the `ndwu-` prefix
  - colors, spacing, radii and typography come from design tokens, not hardcoded values
  - themable values are exposed as component tokens (`*.tokens.scss`)
- Export new public symbols from their entry point: `src/lib/public-api.ts` for the
  root one, or `index.ts` of a secondary entry point (any folder with an
  `ng-package.json`, for example `src/lib/l10n/index.ts`).

## Icons and pictograms

Icon and pictogram SVGs come from Figma. Generated files are never edited by hand.

| Path                                                  | Source                                 |
| ----------------------------------------------------- | -------------------------------------- |
| `scripts/data/icons/`                                 | downloaded by the sync workflows       |
| `src/lib/icon-names.ts`, `src/lib/icon-names.base.ts` | generated by `yarn prepare-icons`      |
| `src/lib/pictogram-names.ts`                          | generated by `yarn prepare-pictograms` |
| `src/lib/assets/` sprites                             | generated by both scripts              |

Two GitHub Actions workflows run every day and commit changes, if any, to `master`
as `chore(sync): ...`:

- `sync-icons.yml` &mdash; icons and pictograms from Figma
- `sync-design-tokens.yml` &mdash; design tokens and icon data from the design source repository

Most pull requests don't need to touch icons.

To pull the latest icons manually (needs the [environment variables](#environment-variables)):

```shell
yarn sync-figma-icons
yarn prepare-icons
yarn prepare-pictograms
```

If a library component starts using a new icon:

1. Reference the icon through `NDWU_ICON_NAME` (for example `NDWU_ICON_NAME.WARNING_S`).
2. Run `yarn prepare-icons`. It finds the icons used by library code and adds them
   to the core sprite (`icon-names.base.ts`).
3. Run `yarn check-base-icons` to confirm the base icon list is up to date.
4. Commit the regenerated files together with the component change.

Icons needed at runtime that the scan can't detect, such as the fallback icon,
go to `src/lib/icon-names.base.manual.ts`. Keep that list short.

`yarn build` runs `prepare-icons` and `prepare-pictograms` too. If it changes
generated files that your pull request doesn't need, don't commit them.

The sprite model (core sprite, extra sprite, consumer CLI) is described in
[ADR 002](docs/architecture/ADR/002-split-icon-sprite.md) and
[ADR 003](docs/architecture/ADR/003-custom-sprite-builder-for-consumers.md).

## Commits

### Branches

Create a branch from an up-to-date `master` and name it after the Jira issue:

```text
NDWU-<number>-<short-description>
```

Examples: `NDWU-150-task-improve-publish-script`, `NDWU-143-fix-listbox-keyboard-handlers`.

To pick up changes from `master`, merge it into your branch.

### Commit messages

```text
(<type>) <area>: <summary> (NDWU-<number>)
```

| Type       | Use for                                        |
| ---------- | ---------------------------------------------- |
| `(task)`   | new feature or the main change of the issue    |
| `(fix)`    | bug fix                                        |
| `(chore)`  | refactoring, dependencies, tooling, playground |
| `(docs)`   | documentation only                             |
| `(review)` | changes made in response to review comments    |

`<area>` is the path of the affected code, shortened:
`lib/core/modal`, `lib/aria/listbox`, `lib/l10n`, `playground/table`, `scripts/publish`,
`docs/codestyle`. List several siblings in braces: `lib/core/{checkbox, radio, toggle}`.

Write the summary in the imperative mood and in lowercase:

```text
(task) lib/core: add tag component (NDWU-102)
(fix) lib/aria/listbox: fix keyboard navigation and active item (NDWU-143)
(review) lib/l10n: rename NdwuLocalizeHtmlPipe to LocalizeHtmlPipe (NDWU-95)
```

## Pull requests

Pull requests are squash-merged, and the squashed commit is the only trace of the
pull request on `master`. Use the commit format without the type prefix as the title:

```text
lib/core: add tag component (NDWU-102)
```

GitHub fills the squash commit title from the commit message when the pull request
has a single commit. Before merging, check that the title matches the pull request title.

The description explains the change to a reviewer. Use these sections and skip any that are empty:

```markdown
## Summary
What problem this solves and how.

## Changes
What changed, grouped by area. Tables work well for lists of components or inputs.

## Breaking changes
What breaks for consumers and how to migrate.

## Verification
How you checked it: commands you ran and what you checked in the playground.

## Notes
Anything the reviewer should know: limitations, follow-ups.
```

Checklist before you request a review:

- [ ] `yarn lint-all` passes with no new warnings
- [ ] `yarn test` passes
- [ ] `yarn build` passes
- [ ] the change is shown or checked in the playground
- [ ] `src/lib/README.md` is updated if public behavior changed
- [ ] breaking changes are listed in the description

Every breaking change must be in the description: maintainers use it to write
[CHANGELOG.md](src/lib/CHANGELOG.md) for the release.

## Review process

1. Open the pull request against `master` and request a review from a maintainer.
2. By convention, a pull request needs one approval before it can be merged.
   Branch protection doesn't enforce this, so don't merge without it.
3. Reply to every review comment: fix it in a `(review)` commit, or explain why not.
4. After approval, the author squash-merges the pull request. The branch is deleted automatically.

Reviewers check:

- the change does what the Jira issue asks, and nothing unrelated
- public API naming, prefixes and entry-point exports
- accessibility: keyboard support, ARIA attributes and focus handling
- theming through component tokens, with both the light and dark themes
- localization: user-facing strings go through `localize` or `localizeHtml`, with English and German playground strings
- breaking changes are called out in the description

# Contributing to NDW UI Kit

This guide is for anyone who wants to change `@ndw-ui-kit/core`: fix a bug, add a component, or improve the tooling.
It covers the workflow from a ticket to a merged pull request.

- [README.md](README.md): the maintainer reference (scripts, internal agreements, component tokens).
- [src/lib/README.md](src/lib/README.md): the consumer docs that ship with the package.
- [docs/codestyle/](docs/codestyle/): coding conventions.

## Table of contents

- [Before you start](#before-you-start)
- [Set up the environment](#set-up-the-environment)
- [Run the playground](#run-the-playground)
- [Run the tests](#run-the-tests)
- [Code requirements](#code-requirements)
- [Icons and pictograms](#icons-and-pictograms)
- [Branches, commits and pull requests](#branches-commits-and-pull-requests)
- [Review process](#review-process)
- [Publishing](#publishing)

## Before you start

- Every change needs an **NDWU** ticket. Its key (for example `NDWU-102`) goes into the branch
  name, the commit messages and the PR title.
- Changes to the public API, or work that will span several PRs, start with a design doc:
  - an RFC (request for comments): see [docs/architecture/RFC/README.md](docs/architecture/RFC/README.md) and
    [GUIDE.md](docs/architecture/RFC/GUIDE.md);
  - an ADR (architecture decision record) for an accepted decision: copy the
    [ADR template](docs/architecture/ADR/000%20architecture-decision-record-template.md).
- If the change affects public behavior, plan to update [src/lib/README.md](src/lib/README.md) in the same PR.

## Set up the environment

You need **Node.js 22** (22.12 or later; CI uses 22) and Git. Node 24 also works.
Yarn **4.4.1** is pinned in `packageManager` in [package.json](package.json), and Corepack provides it:

```shell
corepack enable
git clone git@github.com:kndx-labs/ndw-ui-kit.git
cd ndw-ui-kit
yarn install
yarn prepare-icons && yarn prepare-pictograms
```

The last line generates the git-ignored icon and pictogram sprites in `src/lib/assets/`; without them the playground
shows no icons (`yarn build` generates them too).

Only maintainers who sync icons from Figma need Figma credentials (API key, file key and node IDs, see
[scripts/.env.example](scripts/.env.example)). Ask a maintainer for the file key and node IDs, and put everything in
`scripts/.env`, which is git-ignored:

```shell
cp scripts/.env.example scripts/.env
```

## Run the playground

The playground (`src/playground`) is a local app for checking components by hand.

```shell
yarn start
```

It serves at <http://localhost:4200>. Each component has a page at `/component/<name>/<tab>`,
for example `/component/ndwu-tag/sandbox`. Widgets have pages at `/widget/<name>/<tab>`.

| Command | Localization setup |
|---|---|
| `yarn start` | `@ngx-translate/core` (default configuration) |
| `yarn playground:ngx-translate` | the same, as an explicit `ngx-translate` build configuration |
| `yarn playground:no-l10n` | no-op translation provider, to check the library without real localization |

### Showcases

Component showcases live in `src/playground/app/lib-component-showcase/<name>/`, widget showcases in
`lib-widget-showcase/`. A showcase usually has:

- `overview/`: usage examples;
- `sandbox/`: interactive controls and token overrides (see [Component tokens](README.md#component-tokens));
- `localization/<name>-showcase.json`: English source strings;
- `localization/de/<name>-showcase.json`: German translations.

`yarn test` and every playground script except `yarn playground:no-l10n` merge the localization files into
`src/playground/assets/i18n/` through `scripts/merge-playground-i18n.mjs`. Edit the per-showcase files, not the
merged output.

A new component should come with a showcase. Register it in `lib-component-showcase/showcase-registry.ts`; add it to
`COMPONENTS_LIST`, `COMPONENT_TABS`, `SHOWCASE_NAMES`, `MENU_ITEMS` (and `READY_FOR_REVIEW_COMPONENTS` when it's
ready) in `app/app.constants.ts` and to `ComponentName` in `app/app.types.ts`; add its name and description to
`src/playground/localization/components.json` and `de/components.json`. Widgets and examples follow the same
pattern: `widget-registry.ts` / `example-registry.ts`, the `WIDGET*` / `EXAMPLE*` constants and the `WidgetName` /
`ExampleName` types.

## Run the tests

```shell
yarn test
```

This runs `ng test playground` with the Vitest runner. Specs are `*.spec.ts` files next to the source in `src/lib`.
Add or update specs for new logic and bug fixes.

## Code requirements

| Tool | Checks | Command | Config |
|---|---|---|---|
| dprint | formatting of `src/**/*.ts`, `scripts/**/*.ts` | `yarn fmt` | [dprint.json](dprint.json) |
| ESLint | TypeScript and `*.component.html` templates | `yarn lint:ts` | [eslint.config.js](eslint.config.js) |
| Stylelint | `src/**/*.scss` (relaxed for the playground) | `yarn lint:styles` | [.stylelintrc.js](.stylelintrc.js) |

```shell
yarn lint-all      # ESLint + Stylelint, reports only
yarn lint-all-fix  # Stylelint --fix, then dprint, then ESLint --fix
```

`yarn lint-all` must report **0 errors** before you open a PR. Review the diff after `lint-all-fix` before you commit.

Follow the conventions in [CODESTYLE.md](docs/codestyle/CODESTYLE.md), [NAMING.md](docs/codestyle/NAMING.md) and
[CSS.md](docs/codestyle/CSS.md). Code must work in the browsers listed in [.browserslistrc](.browserslistrc).

Where things go:

| Path | Contents |
|---|---|
| `src/lib` | The library. Secondary entry points (`aria`, `form-field`, `l10n`, `l10n/ngx-translate`, `popover`, `table`, `utils`, `widgets`) have their own `ng-package.json` and are imported as `@ndw-ui-kit/core/<entry>` |
| `src/playground` | The playground app |
| `scripts` | tsx scripts for codegen, sprites and publishing |
| `docs` | Codestyle, ADRs and RFCs |

Export new public symbols from their entry point: `src/lib/public-api.ts` for the root one, or the `index.ts` of a
secondary entry point. New tokenized components follow the
[component tokens checklist](README.md#when-adding-a-new-tokenized-component).

### Checks before a PR

No CI job runs lint, tests or the build, and there are no git hooks. You run them yourself:

```shell
yarn lint-all
yarn test
yarn build
yarn check-base-icons
```

If you changed anything in `scripts/`, also run `yarn build:to-publish`.

`yarn build` runs `prepare-icons` and `prepare-pictograms` first, so it can rewrite the tracked
`src/lib/icon-names.ts`, `src/lib/icon-names.base.ts` and `src/lib/pictogram-names.ts`. Commit them only when your
change needs them (see [Using icons in the library](#using-icons-in-the-library)), and discard other regenerated
changes.

## Icons and pictograms

### Using icons in the library

- Icon and pictogram names come from the generated `src/lib/icon-names.ts` and `src/lib/pictogram-names.ts`.
- Never edit generated files by hand: `icon-names.ts`, `icon-names.base.ts`, `pictogram-names.ts` and the sprites in
  `src/lib/assets/`.

If a library component starts using a new icon:

1. Reference it through `NDWU_ICON_NAME` (for example `NDWU_ICON_NAME.WARNING_S`). Templates are scanned only for
   `NDWU_ICON_NAME.*`; in TypeScript a plain string counts only when it's typed as `NdwuIconName`.
2. Run `yarn prepare-icons`. It adds the icons used in `src/lib` to the core sprite list (`icon-names.base.ts`).
3. Run `yarn check-base-icons` to confirm the list is up to date.
4. Commit `icon-names.base.ts` together with the component change.

Icons needed at runtime that the scan can't detect, such as a fallback icon, go to
`src/lib/icon-names.base.manual.ts`. Keep that list tiny.

### Syncing from Figma

You don't need to sync for regular work. Two workflows run daily and commit to `master`:

| Workflow | Time (UTC) | Updates | Commit |
|---|---|---|---|
| [Sync design tokens](.github/workflows/sync-design-tokens.yml) | 06:00 | design tokens and the SVG sources in `scripts/data/icons/`, from the design source repository | `chore(sync): update design tokens` |
| [Sync icons & pictograms](.github/workflows/sync-icons.yml) | 08:00 | icons and pictograms from Figma | `chore(sync): update icon and pictogram assets` |

To sync by hand (maintainers, needs the Figma credentials in `scripts/.env`):

```shell
yarn sync-figma-icons
yarn prepare-icons
yarn prepare-pictograms
```

Background: [README internal agreements](README.md#internal-agreements),
[ADR 002](docs/architecture/ADR/002-split-icon-sprite.md),
[ADR 003](docs/architecture/ADR/003-custom-sprite-builder-for-consumers.md).

## Branches, commits and pull requests

### Branches

Branch off `master` and push to this repository (no forks). Name the branch `NDWU-<n>-<slug>`, for example
`NDWU-143-fix-listbox-keyboard-handlers`:

```shell
git fetch origin
git switch -c NDWU-<n>-<slug> origin/master
```

### Commits

Commits on your branch use `(type) scope: summary (NDWU-<n>)`. The scope is the path you changed, for example
`lib/core/tag` or `playground/tag`. List several siblings in braces: `lib/core/{checkbox, radio, toggle}`.
Write the summary in the imperative mood and in lowercase.

| Type | Use for |
|---|---|
| `task` | Feature work for the ticket |
| `fix` | A bug fix |
| `ref` | A refactoring without behavior change |
| `chore` | Tooling, config, dependencies, cleanup, playground and small tweaks |
| `docs` | Documentation |
| `review` | Changes that answer PR feedback |

Real examples from PR #31:

```text
(task) lib/core/tag: implement tag component (NDWU-102)
(docs) lib: document tag usage and keyboard removal (NDWU-102)
(review) lib/core/tag: keep touch target unclipped (NDWU-102)
```

Bots use `chore(sync): …`, and RFC PRs use the `rfc:` prefix.

### Pull requests

PRs target `master` and are **squash-merged**. The PR title becomes the commit on `master`, so write it as
`scope: summary (NDWU-<n>)` without the type. GitHub appends the PR number:

```text
lib/core: add tag component (NDWU-102) (#31)
lib/aria/listbox: fix keyboard navigation and active item (NDWU-143) (#34)
scripts/publish: add safety checks (NDWU-150) (#37)
```

For a single-commit PR, GitHub pre-fills the squash title from the commit message instead. Before merging, check
that the title matches the PR title and has no `(type)`.

Keep one concern per PR. A suggested structure for the description (skip empty sections):

| Section | Content |
|---|---|
| `## Summary` | What problem this solves and how |
| `## Changes` | What changed, grouped by area |
| `## Breaking changes` | What breaks for consumers and how to migrate |
| `## Verification` | Commands you ran, the playground page to check (for example `/component/ndwu-tag/sandbox`), screenshots for visual changes |
| `## Notes` | Limitations, follow-ups |

Don't edit `src/lib/CHANGELOG.md`. Maintainers write it at release time from PR descriptions, so list every
breaking change in yours.

## Review process

This is a team agreement; GitHub doesn't enforce it.

1. Get one approval from another maintainer.
2. Reply to every review comment: fix it in a new `(review)` commit, or explain why not. You don't need to
   force-push: the PR is squashed on merge.
3. Merging `master` into your branch to resolve conflicts is fine.
4. Resolve the threads you addressed and re-request review.
5. After approval, squash-merge it yourself (check the title, see [Pull requests](#pull-requests)). GitHub deletes
   the branch.

Reviewers usually look at:

- the change matches the ticket, and nothing unrelated;
- public API naming and entry-point exports;
- keyboard support, ARIA attributes and focus handling;
- theming through component tokens, in the light and dark themes;
- user-facing strings go through `localize` / `localizeHtml`, with English and German playground strings.

## Publishing

Only maintainers publish. See [Publishing requires artifact verification](README.md#3-publishing-requires-artifact-verification).

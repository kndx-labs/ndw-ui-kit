# Contributing to NDW UI Kit

This guide is for anyone who wants to change `@ndw-ui-kit/core`: fix a bug, add a component or improve the tooling.
It covers the workflow from an idea to a merged pull request.

- [README.md](README.md): the maintainer reference (scripts, internal agreements, component tokens).
- [src/lib/README.md](src/lib/README.md): the consumer docs that ship with the package.
- [docs/codestyle/](docs/codestyle/): coding conventions.

## Table of contents

- [Before you start](#before-you-start)
- [Set up the environment](#set-up-the-environment)
- [Run the playground](#run-the-playground)
- [Storybook](#storybook)
- [Run the tests](#run-the-tests)
- [Try the build in your app](#try-the-build-in-your-app)
- [Code requirements](#code-requirements)
- [Icons and pictograms](#icons-and-pictograms)
- [Branches, commits and pull requests](#branches-commits-and-pull-requests)
- [Review process](#review-process)

## Before you start

- Open a GitHub issue to discuss the change first, or go straight to a PR.
- Changes to the public API, or work that will span several PRs, start with a design doc:
  - an RFC (request for comments): see [docs/architecture/RFC/README.md](docs/architecture/RFC/README.md) and
    [GUIDE.md](docs/architecture/RFC/GUIDE.md);
  - an ADR (architecture decision record) for an accepted decision: copy the
    [ADR template](docs/architecture/ADR/000%20architecture-decision-record-template.md).
- If the change affects public behavior, plan to update [src/lib/README.md](src/lib/README.md) in the same PR.

## Set up the environment

You need **Node.js 22.12 or later** (Storybook's ESLint plugin and Compodoc need it) and Git.
Yarn **4.4.1** is pinned in `packageManager` in [package.json](package.json),
and Corepack provides it:

```shell
corepack enable
git clone git@github.com:kndx-labs/ndw-ui-kit.git
cd ndw-ui-kit
yarn install
yarn prepare
yarn prepare-icons && yarn prepare-pictograms
```

If you don't have write access to this repository, clone your fork instead.
`yarn prepare` installs the Husky git hooks. The last line generates
the git-ignored icon and pictogram sprites in `src/lib/assets/`;
without them the playground shows no icons (`yarn build` generates them too).

## Run the playground

The playground (`src/playground`) is a local app for checking components by hand.

```shell
yarn start
```

It serves at <http://localhost:4200>. Each component has a page at `/component/<name>/<tab>`,
for example `/component/ndwu-tag/sandbox`. Widgets have pages at `/widget/<name>/<tab>`.

| Command                         | Localization setup                                                         |
|---------------------------------|----------------------------------------------------------------------------|
| `yarn start`                    | `@ngx-translate/core` (default configuration)                              |
| `yarn playground:ngx-translate` | the same, as an explicit `ngx-translate` build configuration               |
| `yarn playground:no-l10n`       | no-op translation provider, to check the library without real localization |

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

A new component gets [Storybook](#storybook) stories instead of a showcase. Existing showcases stay until the
playground is removed. An existing showcase is registered in `lib-component-showcase/showcase-registry.ts`;
in `COMPONENTS_LIST`, `COMPONENT_TABS`, `SHOWCASE_NAMES`, `MENU_ITEMS` (and `READY_FOR_REVIEW_COMPONENTS` when it's
ready) in `app/app.constants.ts`; in `ComponentName` in `app/app.types.ts`; and by its name and description in
`src/playground/localization/components.json` and `de/components.json`. Widgets and examples follow the same
pattern: `widget-registry.ts` / `example-registry.ts`, the `WIDGET*` / `EXAMPLE*` constants and the `WidgetName` /
`ExampleName` types.

## Storybook

Storybook is replacing the playground, component by component.

```shell
yarn storybook
yarn build-storybook
```

`yarn storybook` serves at <http://localhost:6006>; `yarn build-storybook` writes a static build to `dist/storybook`.
Both generate the icon and pictogram sprites first. Compodoc reads the library once at start: after changing a
component's inputs, restart Storybook. After `prepare-icons`, check `git status`: a change to
`src/lib/icon-names.base.ts` means a lib file changed the core icon set (stories are not scanned).

### Where things go

| What | Where |
|---|---|
| Stories of a component | `<component-file-name>.stories.ts` next to the component in `src/lib`, e.g. `ndwu-button.stories.ts` |
| Pages that don't belong to one component (`Introduction`, `Foundations`, `Examples`) | `src/storybook/` |
| Storybook config, providers, decorators, shared helpers | `.storybook/`, described in [.storybook/README.md](.storybook/README.md) |

Stories get no `.scss` files: `ng-package.json` copies `*.scss` from `src/lib` into the package.

### Titles

| Entry point / folder | Title | Examples |
|---|---|---|
| `core` components | `Core/<Name>` | `Core/Badge`, `Core/Popover` |
| `core` families | `Core/<Group>/<Name>` | `Core/Button/Button`, `Core/Modal/Dialog`, `Core/Dropdown/Autocomplete` |
| `core` families documented on one page | `Core/<Group>` | `Core/Radio` (radio group with its radio buttons) |
| `core/components/field-frame` | `Core/Form Field Frame` | |
| `form-field` | `Form Field/<Name>` | `Form Field/Input Field` |
| `popover` | `Popover API/<Name>` | |
| `table` | `Table/<Name>` | `Table/Paginator` |
| `widgets` | `Widgets/<Name>` | `Widgets/Schedule Editor` |
| `aria`, `schedule-actions`, `l10n` | `Aria/<Name>`, `Schedule Actions/<Name>`, `L10n/<Name>` | |
| `src/storybook/` | `Introduction` (home page), `Foundations/<Page>`, `Examples/<Name>` | |
| `src/storybook/`, stories only embedded in MDX | `Hidden/<Name>` with tag `!dev` | `Hidden/Introduction` |

### Writing stories

- Exports are PascalCase. `Default` has a control for every input. Each other story shows one aspect of the
  component, such as the values of one input, its states or its content forms, with
  `parameters: {controls: {disable: true}}`.
- `component:` is the real component. Use `render` with `argsToTemplate` when the story binds the `size` host
  directive, a native DOM event or projected content: Storybook's generated template binds only the component's own
  inputs and outputs.
- Import the kit through entry-point aliases (`@ndw-ui-kit/core`, `@ndw-ui-kit/core/form-field`, ...), shared helpers
  through `@sb/*`. A new entry-point alias goes into `tsconfig.json`, `tsconfig.playground.json` and
  `.storybook/tsconfig.json`.
- Type args as `Meta<Component & Extra>` / `StoryObj<Component & Extra>`. Storybook maps inputs, outputs and the
  `<name>Change` event of each `model()`. Story-only args and native events (`content`, `click`) go into `Extra`; add
  `SizeArg` from `@sb/helpers/story-args`, `sizeArgType(<sizes the component supports>)` and the same list in
  `parameters.sizes` for components with the `NdwuSizeDirective` host directive (`inputs: ['ndwuSize: size']`), not for
  components with their own `size` input. A Size toolbar value outside `parameters.sizes` leaves the component at its
  default size and shows a "not supported" note.
- Components with the `NdwuAdaptiveSizeDirective` host directive (`inputs: ['ndwuAdaptiveSize: adaptiveSize']`): add
  `AdaptiveSizeArg` (`@sb/helpers/story-args`), `adaptiveSizeArgType(<description>)` and `adaptiveSize: 'viewport'`
  in `meta.args`. `render` excludes `adaptiveSize` from `argsToTemplate`, joins it with
  `adaptiveSizeBinding(args.adaptiveSize)` through `.filter(Boolean).join(' ')` and passes
  `sizeFlags: viewportSizeFlags(<wide size>, <handset size>)` (`@sb/helpers/story-viewport`) in `props`. Check the
  sizes with the Viewport toolbar.
- Compodoc names aliased inputs by their alias (`aria-label` for `ariaLabel`, `id` for `idInput`). Key their args by
  the alias in `Extra`: `AriaArgs` from `@sb/helpers/story-args` when the component aliases `aria-label`,
  `aria-labelledby` and `aria-describedby`, `Pick<AriaArgs, ...>` for a subset. Inputs without an alias keep their
  property name (`ariaLabel`). In fixed stories write the alias as a plain attribute. Once a key is not an identifier
  (`aria-*`), quote every key of `argTypes` / `args` (`quote-props`).
- Shared argTypes live in `@sb/helpers/arg-types`: `sizeArgType`, `adaptiveSizeArgType`, `iconArgType`,
  `pictogramBaseNameArgType`, `pictogramVariantArgType`, `textArgType`, `booleanArgType`, `outputArgType`,
  `eventArgType`; the form-only `submitArgType` lives in `@sb/helpers/story-form`.
- A story that needs the router spreads `withRouter` from `@sb/helpers/story-router` in its `decorators` array:
  `decorators: [...withRouter]`. It adds story-level `provideRouter` and `provideLocationMocks`; `sb-router-url` shows
  the current URL.
- Inputs passed through `localizeHtml` (notification `message`, empty-state `header` / `description`, `ndwuTooltip`
  content) sanitize a plain string (see "HTML in text inputs" in `src/lib/README.md`). To show trusted HTML, pass a
  translation key and add `decorators: [withTranslations({'<key>': '<html>'})]` (`@sb/helpers/story-translations`);
  show the HTML in the story description.
- Descriptions go into `argTypes.<name>.description` in the story file, a one-sentence component intro into
  `parameters.docs.description.component`. Compodoc adds types and defaults of inputs. A story's explanation goes into
  `parameters.docs.description.story`, not into rendered text such as `secondaryText`, which "Show code" copies.
- Set every control's starting value in `meta.args` (e.g. `variant`, booleans `false`, `icon: null`), so the Controls
  panel shows the current value instead of "Choose option...".
- An arg reaches the template only if its argType has a `control` or an `action`; `control: false` removes it.
- "Show code" is what app developers copy, so it must be plain markup:
  - stories with controls set `parameters.docs.source.transform: argsSourceTransform` (`@sb/helpers/args-to-source`),
    which turns `argsToTemplate` bindings into literal attributes;
  - fixed stories build a literal template from typed data in TS (`VARIANTS.map(...)`), without `@for` over props,
    props for constants or inline styles;
  - layout goes into a story decorator, which "Show code" leaves out: `withRowLayout` for one row, `withStackLayout`
    for rows given as `<div>` groups (`@sb/helpers/story-layout`, `group` from `@sb/helpers/story-template`).
- Literal ids in fixed stories follow `<component>-<story-kebab>-<part>` (`toggle-external-label-input`): all stories
  render on one docs page, so an id must be unique there. `Default` uses generated ids.
- Native DOM events: `eventArgType('<event>', '<description>')`. Outputs and `model()` change events:
  `outputArgType('<name>', '<description>')`. Compodoc's output docs are filtered out, so outputs are listed by hand.
- Controlled inputs, whose new value the component reports through an output or a `model()` (`checked` /
  `checkedChange`, `value` / `valueChange`, `selectedTabId` / `tabChange`): `Default` gets
  `decorators: [withControlledArgs('<name>Change', (value) => ({...}))]` (`@sb/helpers/story-controlled`), so a user
  change updates the arg and the Controls panel. On the docs page the decorator does nothing: Storybook's Angular docs
  renderer remounts the story on every args update, and the focused control would lose focus. Hooks such as `useArgs`
  go in decorators, never in `render` (see [.storybook/README.md](.storybook/README.md)). `toArgs` returns only keys
  that are in `meta.args` and never `undefined`: either one changes the template and remounts the story. Fixed stories
  stay uncontrolled literals.
- Components the template uses besides `component:` (radio buttons in a group, a submit button) go into
  `moduleMetadata({imports: [...]})`; `subcomponents` only adds their ArgTypes tab. Their inputs get no controls, so
  fixed stories show them.
- Components with projected content (empty-state actions): `Default` renders typical content as literal markup; fixed
  stories show each content form (none, one, several); kit components in it go into `moduleMetadata` at meta level. In
  `ndwu-empty-state`, don't wrap actions in `@if` / `@for`: their comment anchor counts as an action and keeps the
  24 px gap.
- Native form stories: `decorators: [...withNativeForm]`, `argTypes: {submit: submitArgType}`,
  `props: submitProps(args)` and `template: nativeFormTemplate([...fields])` (`@sb/helpers/story-form`), which wraps the
  fields in `<form (submit)="submit($event)">` and adds the submit button. The handler keeps the page from navigating and
  logs the form entries to Actions; native `required` validation still runs.
- A story that shows wiring between components (`Core/Checkbox` `Indeterminate`) may keep state in `props` as signals.
  Their names must not match any arg, so `argsSourceTransform` leaves them alone.
- Leave `size` unset so the toolbar applies. Don't pin a theme (no `globals.theme`; `parameters.themes.themeOverride`
  is not supported).
- Dialogs and drawers opened through `NdwuModalService` are created from the root injector, so the Size toolbar doesn't
  reach them. In a story, pass the story component's injector: `openDialog(Content, {injector: inject(Injector)})`.
- A component that is ready for review gets the `ready` tag: `tags: ['autodocs', 'ready']`. The sidebar tag filter
  can include or exclude it.
- A new component docs page gets a card in `src/storybook/introduction/introduction.cards.ts`: group (first title
  segment), name, docs id (`<title in kebab case>--docs`, e.g. `core-button-button--docs`), a short plain-text summary
  for the card (no markdown) and `ready` matching the tag.
- Storybook-only components and directives use the `sb-` prefix.
- Widgets follow the same rules; they import from `@ndw-ui-kit/core/widgets` and use the title `Widgets/<Name>`
  (`Widgets/Empty State`). When the component also has a `size` control, start `adaptiveSize` at `unbound`, so `size`
  and the Size toolbar work on load.
- Families without a pattern yet (`*-field` CVA wrappers, overlays, table): the first ticket of the family adds its
  pattern to this section.

### Toolbar

- **Theme** (light, dark) sets `ndwu-theme-*` on `body`; the canvas and docs story blocks follow it. An overlay that is
  already open keeps its theme until it opens again.
- **Size** (component default, S, L, XL, XXL) provides `NDWU_SIZE_TOKEN` around the story, like
  `ndwu-form-container`. Component default provides nothing; an explicit `size` arg wins. Modal dialogs and drawers
  get it only through `config.injector` (see above).
- **Viewport** (Storybook's own) resizes the canvas. Adaptive stories with `adaptiveSize: viewport` switch size at
  `Breakpoints.Handset`: Small and Large mobile are handset, Tablet and Desktop are not. It does not apply on the docs
  page.

### Accessibility

The Accessibility panel runs axe on every story. To turn off a rule for one story, set
`parameters.a11y.config.rules: [{id: '<rule-id>', enabled: false}]` and give the reason in the PR description.

## Run the tests

```shell
yarn test
```

This runs `ng test playground` with the Vitest runner. Specs are `*.spec.ts`
files next to the source in `src/lib`. Add or update specs for
new logic and bug fixes.

To run only some specs, pass `--include`. Its paths are relative
to `src/playground`, not to the repository root, and
can be globs. Add `--watch` to rerun the specs on every change:

```shell
yarn test --include "../lib/widgets/schedule-editor/layout/schedule-blocks.utils.spec.ts"
yarn test --include "../lib/widgets/schedule-editor/**/*.spec.ts" --watch
```

## Try the build in your app

The playground doesn't catch packaging problems, such as a missing export
or asset. To check the library in a real Angular app, use one of these:

- **Fast iteration.** Generate the sprites once, then rebuild on every
  change into `dist/ndw-ui-kit`:

  ```shell
  yarn prepare-icons && yarn prepare-pictograms
  yarn watch
  ```

  In your app, link the package (`yarn link` or a `file:` dependency
  on `dist/ndw-ui-kit`) and set `"preserveSymlinks": true` in the build options
  in its `angular.json`. Without it, the app loads a second copy of
  `@angular/core` from the linked package. `yarn watch` doesn't
  generate the sprites, hence the first command.

- **As released.** Build the package and install the tarball in your app:

  ```shell
  yarn build
  npm pack ./dist/ndw-ui-kit
  ```

## Code requirements

| Tool      | Checks                                         | Command            | Config                               |
|-----------|------------------------------------------------|--------------------|--------------------------------------|
| dprint    | formatting of `src/**/*.ts`, `scripts/**/*.ts` | `yarn fmt`         | [dprint.json](dprint.json)           |
| ESLint    | TypeScript and `*.component.html` templates    | `yarn lint:ts`     | [eslint.config.js](eslint.config.js) |
| Stylelint | `src/**/*.scss` (relaxed for the playground)   | `yarn lint:styles` | [.stylelintrc.js](.stylelintrc.js)   |

```shell
yarn lint-all      # ESLint + Stylelint, reports only
yarn lint-all-fix  # Stylelint --fix, then dprint, then ESLint --fix
```

`yarn lint-all` must report **0 errors** before you open a PR. Review the diff after `lint-all-fix` before you commit.

Follow the conventions in [CODESTYLE.md](docs/codestyle/CODESTYLE.md), [NAMING.md](docs/codestyle/NAMING.md) and
[CSS.md](docs/codestyle/CSS.md). Code must work in the browsers listed in [.browserslistrc](.browserslistrc).

Where things go:

| Path             | Contents                                        |
|------------------|-------------------------------------------------|
| `src/lib`        | The library, see below                          |
| `src/playground` | The playground app                              |
| `scripts`        | tsx scripts for codegen, sprites and publishing |
| `docs`           | Codestyle, ADRs and RFCs                        |

Inside `src/lib`, the root entry point (`@ndw-ui-kit/core`) is made of:

| Path               | Contents                                                                                                                                                                                 |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `core/components/` | One folder per component, named after it; `field-frame/` is the frame of `ndwu-form-field`. Layers and placement rules: [ADR 011](docs/architecture/ADR/011-source-folder-layout.md)     |
| `core/directives/` | Shared directives (size, adaptive size, resize observer)                                                                                                                                 |
| `core/services/`   | Root services (interaction registry)                                                                                                                                                     |
| `core/tokens/`     | Angular DI tokens                                                                                                                                                                        |
| `styles/`          | SCSS mixins, themes, colors, typography and spacing tokens                                                                                                                               |
| `assets/`          | Fonts and the generated, git-ignored sprites                                                                                                                                             |
| root files         | `public-api.ts`, `options.ts`, `shared.types.ts`, `pictogram-presets.ts`; generated `icon-names.ts`, `icon-names.base.ts`, `pictogram-names.ts`; hand-edited `icon-names.base.manual.ts` |

Secondary entry points have their own `ng-package.json` and are imported as `@ndw-ui-kit/core/<entry>`:

| Entry point          | Contents                                                                                                                                                                  |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `aria`               | Headless combobox and listbox directives                                                                                                                                  |
| `form-field`         | `components/` (`<name>-field` form-control wrappers such as `input-field`, `select-field`), `parts/` (`helper-message`), `classes/` (wrapper base classes), `validation/` |
| `l10n`               | Localization pipes (`localize`, `localizeHtml`, `localizeIf`), providers and the translation service                                                                      |
| `l10n/ngx-translate` | The `@ngx-translate/core` adapter                                                                                                                                         |
| `popover`            | Overlay host, trigger directive, dropdown, tooltip and popover panel controllers                                                                                          |
| `table`              | The table, its rows, cells, sorting, column resize and pinning, row drag, paginator and toolbar                                                                           |
| `utils`              | Shared helpers (DOM, coercion, IDs, files, breakpoints, size flags, theme class and class list)                                                                           |
| `widgets`            | Composed widgets: empty state, file upload, schedule editor                                                                                                               |

A new component goes to `core/components/<name>/` and is exported from `core/components/index.ts`, unless it belongs
to `table` or `widgets`; its form wrapper goes to `form-field/components/<name>-field/`. The full rules are in
[ADR 011](docs/architecture/ADR/011-source-folder-layout.md).

Export new public symbols from their entry point: for the root one, the `index.ts` of `core/components`,
`core/directives`, `core/services` or `core/tokens` (re-exported by `src/lib/public-api.ts`), or the `index.ts` of a
secondary entry point. New tokenized components follow the
[component tokens checklist](README.md#when-adding-a-new-tokenized-component).

### Checks before a PR

No CI job runs lint, tests or the build. Run `yarn prepare` once to install the Husky git hooks; they don't run these
checks, so run them yourself:

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

Before you open the PR, make sure that:

- [ ] `yarn lint-all`, `yarn test`, `yarn build` and `yarn check-base-icons` pass;
- [ ] `yarn build:to-publish` passes, if you changed `scripts/`;
- [ ] regenerated icon and pictogram files your change doesn't need are discarded;
- [ ] [src/lib/README.md](src/lib/README.md) is updated, if public behavior changed;
- [ ] a new component has a showcase with English and German strings;
- [ ] breaking changes are listed in the PR description.

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

Design tokens, icons and pictograms are synced from Figma automatically.
Don't sync them in your PR.

Background: [README internal agreements](README.md#internal-agreements),
[ADR 002](docs/architecture/ADR/002-split-icon-sprite.md),
[ADR 003](docs/architecture/ADR/003-custom-sprite-builder-for-consumers.md).

## Branches, commits and pull requests

### Branches

Branch off `master`. If you don't have write access to this repository,
push the branch to your fork and open the PR from there. Name the branch
with a short kebab-case slug, for example `fix-listbox-keyboard-handlers`:

```shell
git fetch origin
git switch -c <slug> origin/master
```

### Commits

Commits on your branch use `(type) scope: summary`. The scope is the path you changed, for example `lib/core/tag` or `playground/tag`. List several siblings in braces:
`lib/core/{checkbox, radio, toggle}`. Write the summary in the imperative mood and in lowercase.

| Type     | Use for                                                             |
|----------|---------------------------------------------------------------------|
| `task`   | Feature work                                                        |
| `fix`    | A bug fix                                                           |
| `ref`    | A refactoring without behavior change                               |
| `chore`  | Tooling, config, dependencies, cleanup, playground and small tweaks |
| `docs`   | Documentation                                                       |
| `review` | Changes that answer PR feedback                                     |

Examples:

```text
(task) lib/core/tag: implement tag component
(docs) lib: document tag usage and keyboard removal
(review) lib/core/tag: keep touch target unclipped
```

Bots use `chore(sync): …`, and RFC PRs use the `rfc:` prefix.

### Pull requests

PRs target `master` and are **squash-merged**. The PR title becomes the commit
on `master`, so write it as `scope: summary` without the type. GitHub appends
the PR number:

```text
lib/core: add tag component (#31)
lib/aria/listbox: fix keyboard navigation and active item (#34)
scripts/publish: add safety checks (#37)
```

Keep one concern per PR. A suggested structure for the description
(skip empty sections):

| Section               | Content                                                                                                                    |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------|
| `## Summary`          | What problem this solves and how                                                                                           |
| `## Changes`          | What changed, grouped by area                                                                                              |
| `## Breaking changes` | What breaks for consumers and how to migrate                                                                               |
| `## Verification`     | Commands you ran, the playground page to check (for example `/component/ndwu-tag/sandbox`), screenshots for visual changes |
| `## Notes`            | Limitations, follow-ups                                                                                                    |

Don't edit `src/lib/CHANGELOG.md`: it's written at release time
from PR descriptions, so list every breaking change in yours.

## Review process

This is a team agreement; GitHub doesn't enforce it.

1. Get one approval from a maintainer.
2. Reply to every review comment: fix it in a new `(review)` commit, or explain
   why not. You don't need to force-push: the PR is squashed on merge.
3. Merging `master` into your branch to resolve conflicts is fine.
4. Resolve the threads you addressed and re-request review.

Reviewers usually look at:

- the change matches the issue or PR description, and nothing unrelated;
- public API naming and entry-point exports;
- keyboard support, ARIA attributes and focus handling;
- theming through component tokens, in the light and dark themes;
- user-facing strings go through `localize` / `localizeHtml`,
  with English and German playground strings.

# 011 Source folder layout and names

- Status: Accepted
- Date: 2026-10-29
- Issue(s): NDWU-147

## Context and Problem Statement

Some folder names in `src/lib` overlap, so it isn't clear where new code goes:

| # | Overlap | What each side holds |
|---|---|---|
| 1 | `core/components/form-field/` and the `form-field` entry point | The visual field frame (`ndwu-form-field`, floating label, hint, suffix, right icon, the `NdwuControl` contract) vs. the ready form fields with `ControlValueAccessor` and validation (`input-field`, `select-field`, ...) |
| 2 | `core/components/popover/`, `core/components/tooltip/` and the `popover` entry point | The popover and tooltip components vs. the overlay engine with its `controllers/popover/` and `controllers/tooltip/` |
| 3 | `form-field/components/file-upload/` and `widgets/file-upload/` | The file upload field wrapper vs. the file upload widget |
| 4 | `utils/popover.ts` | Theme class helpers used by the modal and the overlays, plus `normalizeClass`, named after one of their users |

Overlap 1 is also visible to consumers: `NdwuFormFieldComponent` comes from `@ndw-ui-kit/core`, while
`@ndw-ui-kit/core/form-field` exports no form-field component, only `*-field` wrappers, `ndwu-helper-message` and
validation.

This ADR records the options considered for the names, the chosen option (B), the layers and the rules for
placing new code.

## Considered Options

All options keep exported names, selectors, CSS classes and CSS variables. They differ in how far they go
beyond the four overlaps and in whether a public import path changes.

| Option | Summary | Public import paths |
|---|---|---|
| A | Rename internal folders only: the field frame folder becomes `field-frame/` | Unchanged |
| B | A, plus four internal moves so every folder follows the naming principle | Unchanged |
| C | Keep the field frame folder; rename the `form-field` entry point to `forms`; move `helper-message` to the root entry | `@ndw-ui-kit/core/forms` added; `@ndw-ui-kit/core/form-field` deprecated; `NdwuHelperMessageComponent` from `@ndw-ui-kit/core` |
| D | C, plus the internal moves from B | Same as C |

### Comparison

| | A | B | C | D |
|---|---|---|---|---|
| Moved files | 22 | 39 | 54, plus 3 new files in `forms/` | 67, plus 3 new files in `forms/` |
| Edited files that don't move | 8 | 20 | 44, 30 of them in the playground | 53, 30 of them in the playground |
| Files touched, docs included | 33 | 62 | 104 | 126 |
| Public import paths | Unchanged | Unchanged | `@ndw-ui-kit/core/forms` added; `@ndw-ui-kit/core/form-field` deprecated until 0.4.0; `NdwuHelperMessageComponent` from `@ndw-ui-kit/core` | `@ndw-ui-kit/core/forms` added; `@ndw-ui-kit/core/form-field` deprecated until 0.4.0; `NdwuHelperMessageComponent` from `@ndw-ui-kit/core` |
| Consumer edits | None | None | Import path (one `sed`) | Import path (one `sed`) |
| Folders that don't follow the naming principle | `field-frame/`, `styled-dropdown/`, `button/icon/`, `core/components/interaction/` | `field-frame/` | `styled-dropdown/`, `button/icon/`, `core/components/interaction/` | None |

### Naming principle

- A **component folder** is named after its component without `ndwu-`. Related components may share a group
  folder (`button/`, `radio/`, `modal/`) whose subfolders follow the same rule.
- A **wrapper folder** is `<name>-field/` and lives only in the fields entry point's `components/`.
- A **kind folder** is named after the kind of code it holds: `directives/`, `tokens/`, `services/`, `control/`,
  `classes/`, `validation/`, `parts/`.

Master breaks this principle in four places: `core/components/form-field/` is named like the entry point,
`styled-dropdown/` holds `ndwu-dropdown-panel`, `button/icon/` holds `ndwu-icon-button` (next to
`core/components/icon/` with `ndwu-icon`), and `core/components/interaction/` holds a service. The options differ
in how many of them they fix.

### Path changes per option

Paths are relative to `src/lib/`. "Kept" means the path doesn't change.

| Path on master | A | B | C | D |
|---|---|---|---|---|
| `core/components/form-field/` | `core/components/field-frame/` | `core/components/field-frame/` | Kept | Kept |
| `core/components/form-field/frame/` | `core/components/field-frame/directives/` | `core/components/field-frame/directives/` | `core/components/form-field/directives/` | `core/components/form-field/directives/` |
| `core/components/interaction/` | Kept | `core/services/` | Kept | `core/services/` |
| `core/components/styled-dropdown/` | Kept | `core/components/dropdown-panel/` | Kept | `core/components/dropdown-panel/` |
| `core/components/button/icon/` | Kept | `core/components/button/icon-button/` | Kept | `core/components/button/icon-button/` |
| `popover/controllers/popover/` | `popover/controllers/popover-panel/` | `popover/controllers/popover-panel/` | `popover/controllers/popover-panel/` | `popover/controllers/popover-panel/` |
| `utils/popover.ts` | `utils/theme-class.ts`; `normalizeClass` to a new `utils/class-list.ts` | `utils/theme-class.ts`; `normalizeClass` to a new `utils/class-list.ts` | `utils/theme-class.ts`; `normalizeClass` to `utils/coerce.ts` | `utils/theme-class.ts`; `normalizeClass` to `utils/coerce.ts` |
| `form-field/` (entry `@ndw-ui-kit/core/form-field`) | Kept | Kept | `forms/` (entry `@ndw-ui-kit/core/forms`); `form-field/` becomes a deprecated alias | `forms/` (entry `@ndw-ui-kit/core/forms`); `form-field/` becomes a deprecated alias |
| `form-field/deprecated.ts` | Kept | Kept | Kept, in the alias only | Kept, in the alias only |
| `form-field/components/file-upload/` | `form-field/components/file-upload-field/` | `form-field/components/file-upload-field/` | `forms/components/file-upload-field/` | `forms/components/file-upload-field/` |
| `form-field/components/helper-message/` | Kept | `form-field/parts/helper-message/` | `core/components/helper-message/` | `core/components/helper-message/` |
| `form-field/classes/form-field-base.ts` (`NdwuFormFieldBase`, not exported) | Kept | Kept | `forms/classes/field-base.ts` (`NdwuFieldBase`) | `forms/classes/field-base.ts` (`NdwuFieldBase`) |
| `form-field/form-field.utils.ts` | Kept | Kept | `forms/forms.utils.ts` | `forms/forms.utils.ts` |

Kept in every option: the `popover` entry point name, `core/components/popover/`, `core/components/tooltip/`,
`widgets/file-upload/`, and `NdwuFormFieldComponent` with its `ndwu-form-field` selector.

### How each overlap ends

| # | A, B | C, D |
|---|---|---|
| 1 | The two `form-field` names point to different things (the frame vs. the ready fields), so one has to change. A and B rename the internal one, which is cheaper: the frame folder is named after its role (`field-frame/`) and the entry point keeps `form-field` | The frame keeps `form-field/` (folder = component); the entry point becomes `forms` |
| 2 | Same in all options: `core/components/popover/` and `tooltip/` hold the components of the same name. Unlike overlap 1, both `popover` names point to the same thing: the `popover` entry point is the overlay engine that the popover component is built on, so either folder leads to popover code. `controllers/popover/` becomes `popover-panel/` to match `NdwuPopoverPanelController`, so a third "popover" folder goes away | Same |
| 3 | `form-field/components/file-upload-field/`: every wrapper folder is `<name>-field` | `forms/components/file-upload-field/` |
| 4 | `theme-class.ts` + `class-list.ts`, named by topic | `theme-class.ts`; `normalizeClass` joins the existing `coerce.ts`, so no new file is needed |

### Option A: rename internal folders only

The smallest change that ends all four overlaps without touching public paths.

Names considered for the frame folder: `field-frame` (the term `CONTRIBUTING.md` already uses), `field-shell`
("shell" reads as an app layout part), `form-field-frame` (keeps the exact stem of the entry point, so a search
for `form-field` still finds both), `control-frame` (gives `control-frame/control/`, and "control" already names
the `NdwuControl` contract). No name avoids the exception without a public change.

The frame parts go to `directives/`, not `slots/`. The repo uses "slot" for the modal (ADR 005,
`NdwuModalSlotRegistry`), but keeps those slot directives in `modal/directives/`. Angular Material keeps the frame
parts in `form-field/directives/`, including a component (`notched-outline`). All options then use the same
subfolder name.

- Pros: 22 moved files and path edits in 10 files (`core/components/index.ts`, `field-frame/index.ts`,
  `ndwu-form-field.component.ts`, `textarea/ndwu-textarea.component.ts`,
  `autocomplete/ndwu-autocomplete.component.ts`, `styles/themes.scss`, `popover/controllers/index.ts`,
  `popover/deprecated.ts`, `form-field/components/index.ts`, `utils/index.ts`), none in the playground; no
  consumer changes; the ticket's preferred direction.
- Cons: `field-frame/` holds `ndwu-form-field`, so its folder isn't named after its component; together with
  `styled-dropdown/`, `button/icon/` and `core/components/interaction/`, four folders break the naming principle.
  Consumers still see `@ndw-ui-kit/core/form-field` without a form-field component. The entry point keeps a name
  that the reference libraries give to the frame; that is already true on master, and A doesn't fix it.

### Option B: A plus internal extras

B applies the naming principle everywhere. The only exception left is `field-frame/`, named after its role to
end overlap 1. The principle gives four moves on top of A:

- `core/components/interaction/` → `core/services/`: `NdwuInteractionRegistry` is a root service. `core/` already
  sorts by kind (`directives/`, `tokens/`), and `l10n/services/` is the precedent. `core/interaction/` would be the
  only topic folder among kind folders and would repeat the name of `NdwuPopoverInteractionController`.
- `core/components/styled-dropdown/` → `dropdown-panel/`: the folder holds `ndwu-dropdown-panel`.
- `core/components/button/icon/` → `button/icon-button/`: the folder holds `ndwu-icon-button`; its sibling is
  `timing-button/`, and `core/components/icon/` already holds `ndwu-icon`.
- `form-field/components/helper-message/` → `form-field/parts/helper-message/`: `ndwu-helper-message` is a public
  component of the entry point that isn't a wrapper. Its natural home is the root entry (consumers place it in
  `ndwu-form-field` as `ndwuHint`, its status type is in `shared.types.ts`, and the frame styles it), but moving
  it there changes its public import path, which A and B avoid.

- Pros: everything in A; one folder breaks the principle instead of four; a reviewer checks a new folder against
  the principle instead of a list.
- Cons: A's cons except the folder exceptions; 39 moved files; about 25 more path edits (7 relative imports and a
  barrel line for `services/`, 6 paths for `icon-button/`, 3 for `dropdown-panel/`, 6 imports and 2 paths for
  `parts/`); none of the four moves is one of the ticket's overlaps.

### Option C: rename the `form-field` entry point to `forms`

The field frame keeps `core/components/form-field/`, so its folder is named after its component. The entry point
holding the wrappers and validation becomes `@ndw-ui-kit/core/forms`, after `@angular/forms` and spartan
`brain/forms`. It covers both halves of the entry: the `ControlValueAccessor` wrappers and `validation/`. Names
also considered:

- `fields`: no precedent for ready controls, keeps the "field" stem that the reference libraries give to the
  frame, and doesn't describe `validation/`.
- `form-fields`: keeps the stem whose overlap we're removing.
- `form-controls`: clashes with Angular's `FormControl` and the repo's `NdwuControl`.

The wrapper base class is renamed to `NdwuFieldBase` (`classes/field-base.ts`, not exported, next to
`NdwuSelectFieldBase`), so inside `forms/` the "form-field" stem only names the frame (`NdwuFormFieldComponent`,
`ndwu-form-field__*` classes, `--ndwu-form-field-*` variables).

`ndwu-helper-message` moves to `core/components/helper-message/`. It isn't field-only: consumers project it into
`ndwu-form-field` with `ndwuHint` and no wrapper, its status type `NdwuHelperMessageStatus` is already in
`shared.types.ts`, the frame's SCSS styles it, and it imports nothing from the fields entry. `forms/components/`
then holds only `<name>-field` wrappers. The alias keeps exporting it from the old path.

- Pros: the frame folder follows the naming principle; ends the consumer-facing confusion of overlap 1; matches
  the reference libraries. 0.3.0 isn't released yet, and 0.2.0 already moved public paths without an alias, so a
  rename now costs less than later.
- Cons: a public path changes and needs a deprecation cycle that consumers mostly see in the docs, not the
  editor. 54 moved files, 3 new files in `forms/` (`index.ts`, `ng-package.json`, `package.json`), the 4 alias
  files in `form-field/` rewritten, 31 importer files to update (30 in the playground,
  `table/ndwu-paginator.component.ts`), the paths in `tsconfig.json` and `tsconfig.playground.json`, the
  `ng-package.json` assets glob, `themes.scss:40`, the `name` in `forms/package.json`, the `./frame` import in
  `ndwu-form-field.component.ts`, `core/components/index.ts`, 6 `helper-message` imports in the wrappers, 5 lines
  in `src/lib/README.md` plus a migration note, and 3 lines in `CONTRIBUTING.md`. Until the alias is removed, a
  top-level `form-field/` folder still exists. `styled-dropdown/`, `button/icon/` and
  `core/components/interaction/` still break the naming principle.

### Option D: C plus the internal moves from B

C, plus `core/services/`, `dropdown-panel/` and `button/icon-button/` from B. `helper-message` goes to
`core/components/` as in C, so `parts/` isn't needed.

- Pros: everything in C and B; every folder follows the naming principle; `core/` has one folder per kind
  (`components/`, `directives/`, `services/`, `tokens/`); `core/components/` holds only component folders and
  `forms/components/` only wrappers.
- Cons: everything in C; 67 moved files; B's path edits on top of C's.

### Deprecating `@ndw-ui-kit/core/form-field` (options C and D)

- The alias stays at `src/lib/form-field/`: ng-packagr derives a secondary entry's module id from its folder path,
  not from its `package.json`.
- It keeps four files: `index.ts`, `deprecated.ts`, `ng-package.json`, `package.json`.
- `form-field/index.ts` is `export * from '@ndw-ui-kit/core/forms';`, `export * from './deprecated';` and a
  re-export of `NdwuHelperMessageComponent` from `@ndw-ui-kit/core`. Classes and DI tokens keep one identity.
- The pre-`Ndwu` names in `deprecated.ts` (`isSuccess`, `isValidationError`, `noopValidationProcessor`,
  `ValidatorError`, `ErrorResult`, `ValidatorResult`) stay in the alias only, so `@ndw-ui-kit/core/forms` starts
  without them.
- No per-symbol `@deprecated`. TypeScript can't deprecate a module, `@deprecated` on `export *` marks nothing, and
  ng-packagr's `.d.ts` bundler (rollup-plugin-dts) rewrites re-exports from another entry into one merged
  `export {…} from` statement without their JSDoc. One test build with a throwaway entry confirms this; if the
  tags survive, use named re-exports instead.
- The deprecation is announced in `CHANGELOG.md` and `src/lib/README.md`, with a one-line `sed` for the import
  path and an optional `no-restricted-imports` ESLint rule for consumers.
- No runtime warning: `"sideEffects": false` lets bundlers drop it.
- The alias ships in 0.3.x and is removed in 0.4.0, together with the other `deprecated.ts` files.

### Delivery (options C and D)

One pull request in two steps, so the review diff separates internal moves from the public change. Every file
moves once:

1. Internal moves that keep `form-field/` in place: `frame/` → `directives/`, `popover-panel/`, `utils`, and
   `helper-message` → `core/components/` (the old path re-exports it). D adds `core/services/`, `dropdown-panel/`
   and `button/icon-button/`. No public path is removed.
2. The entry rename: `form-field/` → `forms/` with the alias, `file-upload-field/`, `field-base.ts`,
   `forms.utils.ts`, then the importer files and the docs.

The autocomplete (`core/components/autocomplete/`, `form-field/components/autocomplete-field/`) is already on
master and moves with the rest: its component imports `interaction`, `styled-dropdown` and `button/icon`, and its
wrapper moves to `forms/components/autocomplete-field/`.

### Rejected in every option

1. **Rename the `popover` entry point to `overlay`.** The reference libraries call the engine `overlay` (CDK,
   PrimeNG, spartan), but all 43 exports of the entry point are `NdwuPopover*`, `NDWU_POPOVER_*` or
   `*Controller`. The entry name would then disagree with its symbols. Possible later, together with a symbol
   rename in a breaking release.
2. **Rename `core/components/popover/` and `core/components/tooltip/`.** Each holds the component of the same
   name, and the `popover` entry point is the engine behind it (overlap 2 above).
3. **Group `core/components/` by role** (actions, controls, overlays, feedback, display, layout). It reads well,
   but moves about 238 files and conflicts with open work on `scrollbar/`, `modal/`, `styled-listbox/` and
   `form-field/`. Left for a follow-up once that work is merged. The groups are partly subjective (chip, badge,
   tabs fit two groups) and would need a fixed table.

## Decision Outcome

Option B. It ends all four overlaps and applies the naming principle everywhere except `field-frame/`, without
changing a public import path, so consumers change nothing and no deprecation cycle is needed. Renaming the
`form-field` entry point (C, D) stays possible later, in a release that breaks public paths anyway.

| Path on master | After |
|---|---|
| `core/components/form-field/` | `core/components/field-frame/` |
| `core/components/form-field/frame/` | `core/components/field-frame/directives/` |
| `core/components/interaction/` | `core/services/` |
| `core/components/styled-dropdown/` | `core/components/dropdown-panel/` |
| `core/components/button/icon/` | `core/components/button/icon-button/` |
| `popover/controllers/popover/` | `popover/controllers/popover-panel/` |
| `utils/popover.ts` | `utils/theme-class.ts`; `normalizeClass` to a new `utils/class-list.ts` |
| `form-field/components/file-upload/` | `form-field/components/file-upload-field/` |
| `form-field/components/helper-message/` | `form-field/parts/helper-message/` |

Kept: the `popover` and `form-field` entry points, `core/components/popover/`, `core/components/tooltip/`,
`widgets/file-upload/`, `NdwuFormFieldBase`, `form-field.utils.ts`, and every public import path, exported name,
selector, CSS class and CSS variable.

The change ships in one step. The autocomplete on master moves with the rest: its component's imports of the
frame, `interaction`, `styled-dropdown` and `button/icon` and its wrapper's `helper-message` import get the new
paths.

## Layers

From bottom to top. An entry point imports only from layers below it, through
`@ndw-ui-kit/core/<entry>`; the one import inside a layer is `l10n/ngx-translate` → `l10n`. Relative imports stay
inside one entry point.

| # | Layer | Entry points | Holds |
|---|---|---|---|
| 1 | Foundation | `utils`, `l10n`, `l10n/ngx-translate` | Helpers and localization, no components |
| 2 | Overlay engine | `popover` | Host, trigger directive, dropdown, tooltip and popover panel controllers, scroll lock. No component tokens or themed visuals |
| 3 | Headless | `aria` | Keyboard and ARIA patterns (listbox, combobox). May use the overlay engine |
| 4 | Components | `@ndw-ui-kit/core` (`core/components`, `core/directives`, `core/services`, `core/tokens`) | Visual components, including the field frame |
| 5 | Widgets | `widgets` | Composite components kept out of the root entry, so apps that don't use them don't load them: empty state, file upload, schedule editor |
| 6 | Fields | `form-field` | `ControlValueAccessor` wrappers of components and widgets, wrapper base classes, `ndwu-helper-message`, validation |
| 7 | Feature modules | `table`, `schedule-actions` | Self-contained features on any layer below; `table` uses `form-field` for the paginator |

## Where new code goes

0. Put code in the lowest layer that has everything it imports, then pick the folder by the naming principle.
1. A visual component goes to `core/components/<name>/`, named after its component (`ndwu-<name>`). Related
   components may share a group folder (`button/`, `radio/`, `modal/`).
2. The Angular forms wrapper of a component or widget goes to `form-field/components/<name>-field/`, where
   `<name>` is the wrapped component or widget (`file-upload-field/` wraps the `file-upload` widget). A part used
   by one wrapper only stays in that wrapper's folder (`multi-select-field/ndwu-multi-select-display.directive.ts`).
   A component of the `form-field` entry point that isn't a wrapper goes to `form-field/parts/<name>/`
   (`helper-message/`). Wrapper base classes go to `form-field/classes/`, validators and processors to
   `form-field/validation/`.
3. A part that `ndwu-form-field` projects or queries (label, hint, suffix, right icon) goes to
   `core/components/field-frame/directives/`. The `NdwuControl` contract and the directives that implement it on a
   native element (`ndwuInput`) go to `core/components/field-frame/control/`; a component that implements it
   (`ndwu-textarea`) keeps its own folder by rule 1.
4. A directive shared by several components goes to `core/directives/`, a DI token to `core/tokens/`, a root
   service to `core/services/`.
5. Overlay behavior (positioning, triggers, scroll lock) goes to `popover/`. A new overlay controller goes to
   `popover/controllers/<name>/`, named after its class (`Ndwu<Name>Controller` in `<name>.controller.ts`). A
   component shown inside an overlay goes to `core/components/<name>/`.
6. Headless keyboard and ARIA patterns go to `aria/<pattern>/`.
7. A composite component that most apps don't need goes to `widgets/<name>/`.
8. Code used by only one feature module stays in that module (`table/`, `schedule-actions/`).
9. A helper without DI that several entry points use goes to `utils/<topic>.ts`, named by what it does, not by
   its first user. `utils` is public, so a helper used inside one entry point stays there
   (`form-field/form-field.utils.ts`, `*.helpers.ts` next to its component).
10. Only `styles/*` SCSS is public. Component `*.tokens.scss` paths are internal and may move.

## Consequences

### Pros:

- Each overlap ends: `popover` and `form-field` stop naming two different things inside `src/lib`, and `utils`
  files are named by topic.
- No public import path changes: consumers change nothing, and no alias or deprecation cycle is needed.
- Every folder except `field-frame/` follows the naming principle; `core/` has one folder per kind,
  `core/components/` holds only component folders and `form-field/components/` only wrappers.
- New code has a written place, and imports have a written direction.
- `git mv` keeps `git log --follow` and `git blame` per file.

### Cons:

- `field-frame/` holds `ndwu-form-field`, so its folder isn't named after its component.
- Consumers still see `@ndw-ui-kit/core/form-field` without a form-field component, while
  `NdwuFormFieldComponent` comes from `@ndw-ui-kit/core`. The entry point keeps the name that the reference
  libraries give to the frame.
- 39 moved files and 20 edited ones, none in the playground; the review diff is mostly renames and import paths.
- None of the four extra moves (`core/services/`, `dropdown-panel/`, `button/icon-button/`, `parts/`) is one of
  the ticket's overlaps.
- SCSS files inside the published package move. Only someone who `@use`s them by a raw `node_modules` path is
  affected; that path was never public.
- Open branches that touch the moved folders need their paths updated on rebase.

## Reference libraries

| Concept | Angular Material + CDK | Taiga UI | PrimeNG | spartan/ui | ng-primitives |
|---|---|---|---|---|---|
| Field frame | `material/form-field` (parts in `form-field/directives/`) | `core/components/textfield` | `floatlabel`, `inputgroup` | `brain/field`, `helm/field` | `form-field` |
| Ready controls | `material/input`, `material/select` | `kit/components/input-*` | `inputtext`, `select` | `helm/*`, forms glue in `brain/forms` | none |
| Overlay engine | `cdk/overlay` | `cdk/portals` | `overlay` | `brain/overlay` | `portal` |
| Small helpers | `cdk/coercion`, `cdk/platform` | `cdk/utils` | `dom`, `classnames`, `utils` | `helm/utils` | `utils` |

None of them uses "form-field"/"field" for ready controls, and none calls the overlay engine "popover". Taiga's
`cdk` / `core` / `kit` / `addon-*` tiers map onto ndw-ui-kit's entry points.

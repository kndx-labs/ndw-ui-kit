# 010 Second npm package for charts

- Status: Proposed
- Date: 2026-10-22
- Issue(s): NDWU-123

## Context and Problem Statement

The repository needs a separately publishable charts package that reuses
core components, tokens, and utilities without bundling a second copy of
core. The package should have an independent release lifecycle and keep
the first chart generic rather than tied to one product domain.

## Considered Options

1. **Add a secondary entrypoint to core.** Rejected: the requirement is a
   separate npm package with its own release lifecycle.
2. **Add workspaces and a `projects/` directory.** Rejected: this adds
   monorepo machinery without enough benefit for two packages.
3. **Keep package versions in lockstep.** Rejected: unchanged packages
   would need empty releases whenever the other package changes.
4. **Put charts tokens in the core theme.** Rejected: core would acquire
   a reverse dependency on charts.

## Decision Outcome

Create `@ndw-ui-kit/charts` in `src/charts`, next to `src/lib`. Do not add
workspaces or a `projects/` directory. Keep `@ndw-ui-kit/core` as a peer
dependency so consumers use the same core instance for styles and
dependency-injection tokens.

Give each package its own version. Charts starts at `0.1.0`. Its core peer
range is a caret range whose floor is a published core version that contains
every core API charts uses. Build and smoke tests run against that version.
When charts starts using a new core API, release core first and raise the
floor. Enforce `semver.satisfies` when charts is selected for publication. At
`0.x`, a core minor release leaves the prior caret range, so charts needs a
release with an updated range. Do not claim or test compatibility with core
versions below that range. A core-only release may proceed with a warning if
charts' range no longer includes the current core version.

Use separate TypeScript configurations for development and packaging.
Development resolves core from source so the IDE, ESLint, specs, and
playground work without a built core package. Charts builds resolve core
from `dist`, matching the consumer package boundary and keeping core out of
the charts bundle.

Give each charts component its own flat `*.tokens.scss` map, with values
referencing core tokens. A charts theme entry emits only charts tokens
under `:root`, `.ndwu-theme-light`, and `.ndwu-theme-dark`. Re-emitting
under the theme classes lets token references resolve against the active
theme inside nested themed subtrees. Consumers load the core theme first,
then the charts theme; core does not depend on charts.

Charts Sass imports core by package name. Repository builds generate local
aliases for that package name, targeting core source during development and
the built core styles during charts packaging. Published Sass imports stay
package-based.

Publish packages only when explicitly selected, in core-then-charts order.
Smoke-test charts with the core tarball consumers will receive: the local
tarball when core is selected in the same release, otherwise the published
core version's tarball. Suggest `v<version>` tags for core and
`charts-v<version>` for charts. Do not add a charts watch target.

The consumer smoke test checks the package contract, not component
behavior. It builds a fixture app in production mode against packed
tarballs and verifies what only a consumer sees: tarball contents and
`exports`, core staying a peer instead of being bundled, Sass imports of
core resolving from `node_modules`, partial-compiled code linking in the
consumer build, and typed template contexts reaching `strictTemplates`.
Component behavior belongs to unit tests in the repository. The fixture
keeps one representative per integration mechanism (theme, typed template,
public subpath), not one usage per component, and a single negative build
for template typing; add another negative build only for a new typing
mechanism. If full public API coverage is needed, compile a generated
module that references every export in the same build. This keeps the
smoke cost per package rather than per component. Smoke workspaces and
other release scratch files live under `dist/.tmp`.

Name the first component `HeatStrip` for its one-dimensional strip. Reserve
`Heatmap` for a possible two-dimensional grid; do not model `HeatStrip` as
a special case of `Heatmap`.

## Consequences

### Pros:

- Charts can evolve and release independently while reusing core.
- Peer dependency keeps one shared core boundary for styles and
  dependency-injection tokens.
- Separate token themes preserve package ownership and support nested
  light and dark theme scopes.
- Explicit publication selection and consumer smoke tests make release
  inputs and compatibility visible.

### Cons:

- Core and charts versions must be coordinated through the charts peer
  range; a core `0.x` minor can require a charts release.
- Development and package builds need separate resolution settings and
  generated Sass aliases.
- Consumers must load core theme before charts theme.

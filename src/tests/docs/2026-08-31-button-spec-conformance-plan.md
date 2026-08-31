# Button Spec-Conformance Test Suite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-browser conformance test suite that audits `NdwuButtonComponent` against `md_design/button.md`, and produces a list of specification defects as a by-product.

**Architecture:** Angular TestBed specs run in headless Chromium through `@angular/build:unit-test` with the vitest runner and the Playwright provider, so `getComputedStyle` returns real values. Every rule in the specification carries a stable ID; every ID is referenced by either a real test or a blank `it.todo` that states why it cannot be tested. A coverage script fails the build if any rule goes unreferenced.

**Tech Stack:** Angular 20 · vitest 3.2.7 · `@vitest/browser` · Playwright (chromium) · TypeScript 5.9 · tsx

**Spec:** `ndw-ui-kit/src/tests/docs/2026-08-31-button-spec-conformance-design.md`

## Global Constraints

- **A failing test is a finding, not a bug to fix.** This suite audits the implementation against a specification whose source of truth is Figma. **Never modify `src/lib/**` to make a test pass.** If a test fails, confirm the test encodes the specification correctly, then record it in `FINDINGS.md`. Changing component code is out of scope for every task in this plan.
- All authored files live under `ndw-ui-kit/src/tests/`. The only permitted edits outside it are: `angular.json`, `package.json`, `tsconfig.spec.json`, and `md_design/button.md`.
- Paths in `angular.json`: `include` globs resolve from `sourceRoot` (`src/playground`); `providersFile` and `setupFiles` resolve from the **workspace root**.
- Rule ID format: `BTN-{SEC}-{NN}`, sections `CLR TYP LAY ELV SHP VAR CMP STA ACC DOD`. IDs are permanent and are never renumbered.
- Assertions never use `offsetWidth` or `getBoundingClientRect()`; fonts may be unavailable in the test page. Use computed CSS properties only.
- No `retry` configuration anywhere. A flaky test is a finding.
- Working directory for all commands: `ndw-ui-kit/`.

---

### Task 1: Runner wiring and verification gate

**Files:**
- Modify: `package.json` (devDependencies, scripts)
- Modify: `angular.json` (`playground.architect.build.configurations.test`, `playground.architect.test-conformance`)
- Modify: `tsconfig.spec.json` (include)
- Create: `src/tests/test-providers.ts`
- Create: `src/tests/helpers/tokens.ts`
- Create: `src/tests/setup.ts`
- Test: `src/tests/gate.spec.ts` (deleted at the end of this task)

**Interfaces:**
- Consumes: nothing.
- Produces: `cssVar(name: string, el?: Element): string`, `waitForTheme(timeoutMs?: number): Promise<void>` from `src/tests/helpers/tokens.ts`; a working `yarn test:conformance` command.

- [ ] **Step 1: Install the browser runner dependencies**

```bash
yarn add -D @vitest/browser playwright
```

- [ ] **Step 2: Download the Chromium binary Playwright drives**

```bash
yarn exec playwright install chromium
```

- [ ] **Step 3: Add the test build configuration to `angular.json`**

Under `projects.playground.architect.build.configurations`, add a `test` entry alongside the existing `development` / `production` / `no-l10n` / `ngx-translate` entries. Both global styles must share one `bundleName`, because the unit-test builder injects only the stylesheet named `styles.css`:

```jsonc
"test": {
  "optimization": false,
  "extractLicenses": false,
  "sourceMap": true,
  "styles": [
    {"input": "src/playground/styles/ndw-ui-kit-theme.scss", "bundleName": "styles"},
    {"input": "src/playground/styles.scss", "bundleName": "styles"}
  ]
}
```

- [ ] **Step 4: Add the conformance test target to `angular.json`**

Under `projects.playground.architect`, next to the existing `test` target:

```jsonc
"test-conformance": {
  "builder": "@angular/build:unit-test",
  "options": {
    "buildTarget": "playground:build:test",
    "runner": "vitest",
    "browsers": ["ChromiumHeadless"],
    "include": ["../tests/**/*.spec.ts"],
    "tsConfig": "tsconfig.spec.json",
    "providersFile": "src/tests/test-providers.ts",
    "setupFiles": ["src/tests/setup.ts"]
  }
}
```

Leave the existing `test` target untouched. Its `include` is `../lib/**/*.spec.ts`, which cannot match `src/tests`, so the two suites stay separate.

- [ ] **Step 5: Add the include path for test helpers to `tsconfig.spec.json`**

The current `include` lists only `src/**/*.d.ts` and `src/**/*.spec.ts`. Helper modules are neither, and `mount.ts` (Task 2) declares an Angular component that must be part of the compilation:

```jsonc
"include": [
  "src/**/*.d.ts",
  "src/**/*.spec.ts",
  "src/tests/**/*.ts"
]
```

- [ ] **Step 6: Add the npm script**

In `package.json` `scripts`, after the existing `"test"` entry:

```json
"test:conformance": "ng run playground:test-conformance",
```

- [ ] **Step 7: Create the providers file**

`provideNdwUiKitNoopTranslation` returns a `Provider[]` whose `NoopTranslationService.instant()` echoes the key, so `label="Save"` renders `Save` with no translation setup. It is exported from the `@ndw-ui-kit/core/l10n` entry point, **not** from `@ndw-ui-kit/core`.

Create `src/tests/test-providers.ts`:

```ts
import {Provider} from '@angular/core';
import {provideNdwUiKitNoopTranslation} from '@ndw-ui-kit/core/l10n';

const providers: Provider[] = [
  ...provideNdwUiKitNoopTranslation(),
];

export default providers;
```

- [ ] **Step 8: Create the token helper with the theme guard**

Create `src/tests/helpers/tokens.ts`:

```ts
const THEME_SENTINEL = '--ndwu-color-brand-50';

export const cssVar = (name: string, el: Element = document.documentElement): string => {
  return getComputedStyle(el).getPropertyValue(name).trim();
};

export const waitForTheme = async (timeoutMs = 2000): Promise<void> => {
  const deadline = performance.now() + timeoutMs;

  while (performance.now() < deadline) {
    if (cssVar(THEME_SENTINEL)) {
      return;
    }

    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  throw new Error(
    `theme stylesheet not injected: ${THEME_SENTINEL} is empty after ${timeoutMs}ms. `
    + 'The unit-test builder injects only "styles.css" — check that both global styles in '
    + 'playground:build:test share bundleName "styles".',
  );
};
```

The poll exists because the stylesheet is a `<link>`; asserting at module-evaluation time would race its load and report a wiring failure that is not real.

- [ ] **Step 9: Create the global setup file**

Create `src/tests/setup.ts`:

```ts
import {beforeAll} from 'vitest';
import {waitForTheme} from './helpers/tokens';

const NO_MOTION_STYLE_ID = 'ndwu-test-no-motion';

const disableMotion = (): void => {
  if (document.getElementById(NO_MOTION_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = NO_MOTION_STYLE_ID;
  style.textContent = '*, *::before, *::after {'
    + 'transition: none !important;'
    + 'animation: none !important;'
    + '}';
  document.head.appendChild(style);
};

beforeAll(async () => {
  disableMotion();
  await waitForTheme();
});
```

The button's base style transitions `border-color`, `background-color`, `color`, `box-shadow` and `filter` over 0.2s. Without this, a colour read taken right after a hover returns a mid-transition interpolation.

- [ ] **Step 10: Write the gate spec**

Create `src/tests/gate.spec.ts`:

```ts
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from 'vitest';
import {NdwuButtonComponent} from '@ndw-ui-kit/core';
import {cssVar} from './helpers/tokens';

@Component({
  selector: 'ndwu-gate-host',
  imports: [NdwuButtonComponent],
  template: `<button ndwu-button label="Gate"></button>`,
})
class GateHostComponent {}

describe('wiring gate', () => {
  it('renders a real button with real layout', () => {
    const fixture = TestBed.createComponent(GateHostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(getComputedStyle(host).height).toBe('44px');
  });

  it('resolves design tokens from the injected theme', () => {
    expect(cssVar('--ndwu-color-brand-50')).not.toBe('');
  });
});
```

Three things are proven at once: `@ndw-ui-kit/core` resolves under `tsconfig.spec.json`, the default size path yields `XL` (44px), and the theme stylesheet reached the page.

- [ ] **Step 11: Run the gate**

```bash
yarn test:conformance
```

Expected: 2 passing tests.

If `height` is `0px` or empty, the browser provider is not active — re-check `browsers` and that `playwright` installed. If the token assertion fails with the `theme stylesheet not injected` error, the `bundleName` change in Step 3 did not take effect.

- [ ] **Step 12: Delete the gate spec**

```bash
rm src/tests/gate.spec.ts
```

It has served its purpose; the harness self-test in Task 2 replaces it.

- [ ] **Step 13: Commit**

```bash
git add package.json yarn.lock angular.json tsconfig.spec.json src/tests
git commit -m "test: wire browser-based conformance test runner"
```

---

### Task 2: Mount harness and style helpers

**Files:**
- Create: `src/tests/helpers/styles.ts`
- Create: `src/tests/helpers/mount.ts`
- Modify: `src/tests/setup.ts`
- Test: `src/tests/helpers/harness.spec.ts`

**Interfaces:**
- Consumes: `cssVar`, `waitForTheme` from `src/tests/helpers/tokens.ts`.
- Produces:
  - `hexToRgb(hex: string): string` and `isZeroLetterSpacing(value: string): boolean` from `helpers/styles.ts`
  - `ButtonState` interface, `mountButton(patch?: Partial<ButtonState>): MountedButton`, `destroyAllMounted(): void` from `helpers/mount.ts`
  - `MountedButton` = `{fixture: ComponentFixture<ButtonHostComponent>; host: HTMLButtonElement; styles(): CSSStyleDeclaration; update(patch: Partial<ButtonState>): void}`

- [ ] **Step 1: Write the failing harness self-test**

Create `src/tests/helpers/harness.spec.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {SIZE} from '@ndw-ui-kit/core';
import {mountButton} from './mount';
import {hexToRgb, isZeroLetterSpacing} from './styles';

describe('test harness', () => {
  it('mounts a button attached to the document', () => {
    const {host} = mountButton({label: 'Save'});

    expect(document.body.contains(host)).toBe(true);
    expect(host.tagName).toBe('BUTTON');
    expect(host.textContent).toContain('Save');
  });

  it('applies inputs and runs change detection', () => {
    const {host, styles} = mountButton({size: SIZE.S});

    expect(host.classList).toContain('ndwu-button--S');
    expect(styles().height).toBe('24px');
  });

  it('re-renders on update()', () => {
    const {styles, update} = mountButton({size: SIZE.S});

    update({size: SIZE.XXL});

    expect(styles().height).toBe('56px');
  });

  it('converts hex to the browser rgb format', () => {
    expect(hexToRgb('#007bbe')).toBe('rgb(0, 123, 190)');
    expect(hexToRgb('#fff')).toBe('rgb(255, 255, 255)');
  });

  it('treats normal and 0px as zero letter-spacing', () => {
    expect(isZeroLetterSpacing('normal')).toBe(true);
    expect(isZeroLetterSpacing('0px')).toBe(true);
    expect(isZeroLetterSpacing('-0.1px')).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

```bash
yarn test:conformance
```

Expected: FAIL — cannot resolve `./mount` and `./styles`.

- [ ] **Step 3: Write the style helpers**

Create `src/tests/helpers/styles.ts`:

```ts
const channel = (hex: string, offset: number): number => {
  return Number.parseInt(hex.slice(offset, offset + 2), 16);
};

/**
 * The specification states colours as hex; getComputedStyle reports rgb().
 * Without this every colour assertion fails on formatting rather than value.
 */
export const hexToRgb = (hex: string): string => {
  const value = hex.replace('#', '');
  const full = value.length === 3
    ? [...value].map((c) => `${c}${c}`).join('')
    : value;

  return `rgb(${channel(full, 0)}, ${channel(full, 2)}, ${channel(full, 4)})`;
};

/**
 * The specification assigns letterSpacing L (0) to sizes L and S. The component
 * sets letter-spacing only for XL and XXL, so L and S inherit the initial value
 * and compute to `normal`. Visually identical to 0; textually different.
 */
export const isZeroLetterSpacing = (value: string): boolean => {
  return value === 'normal' || value === '0px';
};
```

- [ ] **Step 4: Write the mount harness**

Create `src/tests/helpers/mount.ts`:

```ts
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BUTTON_VARIANT, NdwuButtonComponent} from '@ndw-ui-kit/core';
import type {ButtonVariant, IconName, Size} from '@ndw-ui-kit/core';

export interface ButtonState {
  variant: ButtonVariant;
  size: Size | undefined;
  disabled: boolean;
  loading: boolean;
  icon: IconName | null;
  label: string;
  content: string;
}

const DEFAULT_STATE: ButtonState = {
  variant: BUTTON_VARIANT.PRIMARY,
  size: undefined,
  disabled: false,
  loading: false,
  icon: null,
  label: '',
  content: 'Button',
};

@Component({
  selector: 'ndwu-test-button-host',
  imports: [NdwuButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      ndwu-button
      [variant]="state().variant"
      [size]="state().size"
      [disabled]="state().disabled"
      [loading]="state().loading"
      [icon]="state().icon"
      [label]="state().label"
    >{{ state().content }}</button>
  `,
})
export class ButtonHostComponent {
  public readonly state = signal<ButtonState>(DEFAULT_STATE);
}

export interface MountedButton {
  fixture: ComponentFixture<ButtonHostComponent>;
  host: HTMLButtonElement;
  styles: () => CSSStyleDeclaration;
  update: (patch: Partial<ButtonState>) => void;
}

const mounted: ComponentFixture<ButtonHostComponent>[] = [];

export const mountButton = (patch: Partial<ButtonState> = {}): MountedButton => {
  const fixture = TestBed.createComponent(ButtonHostComponent);
  fixture.componentInstance.state.set({...DEFAULT_STATE, ...patch});
  fixture.detectChanges();
  mounted.push(fixture);

  const host = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

  return {
    fixture,
    host,
    styles: () => getComputedStyle(host),
    update: (next: Partial<ButtonState>): void => {
      fixture.componentInstance.state.update((current) => ({...current, ...next}));
      fixture.detectChanges();
    },
  };
};

export const destroyAllMounted = (): void => {
  while (mounted.length > 0) {
    mounted.pop()?.destroy();
  }
};
```

No width getter is exposed. Rendered width depends on font availability, and Roboto is unlikely to load in the test page; minimum-width rules assert the computed `min-width` property instead.

- [ ] **Step 5: Add teardown to the setup file**

In `src/tests/setup.ts`, extend the imports and add an `afterEach`:

```ts
import {afterEach, beforeAll} from 'vitest';
import {destroyAllMounted} from './helpers/mount';
import {waitForTheme} from './helpers/tokens';
```

and after the existing `beforeAll` block:

```ts
afterEach(() => {
  destroyAllMounted();
});
```

Leftover fixtures accumulate in the document across tests. A stale focused button breaks the `Tab`-based focus assertions in Task 6.

- [ ] **Step 6: Run the harness self-test**

```bash
yarn test:conformance
```

Expected: 5 passing tests.

- [ ] **Step 7: Commit**

```bash
git add src/tests
git commit -m "test: add button mount harness and style helpers"
```

---

### Task 3: Assign rule IDs in the specification

**Files:**
- Modify: `md_design/button.md` (outside the repository; path is `../md_design/button.md` from `ndw-ui-kit/`)

**Interfaces:**
- Consumes: nothing.
- Produces: 42 stable rule IDs referenced by every later task, and `ruleIdPrefix: BTN` in the frontmatter.

- [ ] **Step 1: Add the prefix to the frontmatter**

In the YAML frontmatter of `md_design/button.md`, directly under `version: alpha`:

```yaml
ruleIdPrefix: BTN
```

- [ ] **Step 2: Add the ID convention to the Legend section**

At the end of the `### Legend — rule tags` section, after the three tag bullets:

```markdown
Each rule additionally carries a stable identifier — `BTN-{SECTION}-{NN}` —
placed immediately after its tag. Identifiers are permanent: a rule added later
takes the next free number in its section even if it sits mid-document.
Renumbering would invalidate every conformance test name and every recorded
finding. Legend entries themselves carry no identifier.
```

- [ ] **Step 3: Split the two compound rules**

Two bullets each make two claims, one testable and one not. Split so each ID carries a single claim.

In **Layout**, replace:

```markdown
- **[CODE]** Each size has a fixed height — XXL 56, XL 44, L 32, S 24 px — and
  its own padding and border radius (see Shapes).
```

with:

```markdown
- **[CODE]** (BTN-LAY-04) Each size has a fixed height — XXL 56, XL 44, L 32,
  S 24 px.
- **[CODE]** (BTN-LAY-05) Each size has its own padding. *Values are not stated
  in this document; see Shapes for radius.*
```

In **Shapes**, replace:

```markdown
- **[CODE]** All variants use a 1px border; ghost/tertiary render it
  transparent or token-driven per state.
```

with:

```markdown
- **[CODE]** (BTN-SHP-02) All variants use a 1px border.
- **[CODE]** (BTN-SHP-03) Ghost and tertiary render that border transparent or
  token-driven per state.
```

- [ ] **Step 4: Tag the untagged rule**

In **Elevation & Depth**, the bullet beginning "Buttons otherwise sit flat" carries no tag — the only such rule in the document. Replace it with:

```markdown
- **[CODE]** (BTN-ELV-03) Buttons otherwise sit flat on the surface; there is no
  resting elevation.
```

- [ ] **Step 5: Insert the remaining IDs**

Add each ID immediately after its tag, in document order. Full assignment:

| ID | Tag | Rule |
|---|---|---|
| BTN-CLR-01 | DS + CODE | Full colour token set per type, resolved per state and status |
| BTN-CLR-02 | CODE | Disabled uses dedicated disabled tokens, not opacity |
| BTN-CLR-03 | DS | `negative` colour reserved for risky/destructive actions |
| BTN-TYP-01 | CODE | Roboto with `"Helvetica Neue", sans-serif` fallback |
| BTN-TYP-02 | CODE | XXL and XL: 16/24, letterSpacing S (−0.1) |
| BTN-TYP-03 | CODE | L and S: 12/17, letterSpacing L (0) |
| BTN-TYP-04 | CODE | Label does not wrap |
| BTN-LAY-01 | DS | Size guide — which size for which context |
| BTN-LAY-02 | DS + CODE | XL is the default size |
| BTN-LAY-03 | CODE | Minimum width per size — 120 / 96 / 64 / 48 |
| BTN-LAY-04 | CODE | Fixed height per size — 56 / 44 / 32 / 24 |
| BTN-LAY-05 | CODE | Per-size padding (no values stated) |
| BTN-ELV-01 | CODE | Enabled hover applies a subtle drop-shadow filter |
| BTN-ELV-02 | CODE | Focus ring via `fx-focused-default` / `fx-focused-primary` |
| BTN-ELV-03 | CODE | No resting elevation |
| BTN-SHP-01 | CODE | Border radius per size — 4 / 6 / 8 / 8 |
| BTN-SHP-02 | CODE | All variants use a 1px border |
| BTN-SHP-03 | CODE | Ghost/tertiary border transparent or token-driven |
| BTN-VAR-01 | CODE | Providing the variants is the component's responsibility |
| BTN-VAR-02 | DS | Primary — use / don't use |
| BTN-VAR-03 | DS | Secondary — use / don't use |
| BTN-VAR-04 | DS | Tertiary — use / don't use |
| BTN-VAR-05 | DS | Ghost — use / don't use |
| BTN-VAR-06 | DS | Negative status — use / don't use |
| BTN-VAR-07 | DS | Positive status — use / don't use |
| BTN-VAR-08 | DS | Warning status — use / don't use |
| BTN-VAR-09 | DS | Documented negative/critical usage list |
| BTN-CMP-01 | DS + CODE | Optional icon slot plus label slot |
| BTN-CMP-02 | CODE | Loading hides the icon, shows the loader, keeps the label |
| BTN-STA-01 | CODE | Renders default, hover, focused, pressed, disabled, loading |
| BTN-STA-02 | CODE | Disabled uses native `disabled` and `cursor: not-allowed` |
| BTN-STA-03 | CODE | Loading blocks pointer events, sets no `disabled`/`aria-busy` |
| BTN-ACC-01 | DS + CODE | `aria-label` required for text-less buttons; never auto-generated |
| BTN-ACC-02 | DS | `aria-pressed` belongs to toggle buttons; not managed here |
| BTN-ACC-03 | DS + CODE | Native `<button>` focusable; do not break tabindex |
| BTN-ACC-04 | DS + CODE | TAB focuses, SPACE/ENTER activates |
| BTN-ACC-05 | CODE | Loading caveat — no `aria-busy`, does not block keyboard activation |
| BTN-DOD-01 | DS | Exactly one primary per screen or modal |
| BTN-DOD-02 | DS | Don't use tertiary/negative for frequent actions or deletion |
| BTN-DOD-03 | DS + CODE | Give a text-less button an accessible name |
| BTN-DOD-04 | CODE | Rely on native `<button>` with `type="button"` |
| BTN-DOD-05 | DS | Open item — `positive`/`warning` not exposed as coded variants |

Note the shapes the IDs must fit:

```markdown
- **[CODE]** (BTN-TYP-04) Label text does not wrap (`white-space: nowrap`).
- **Primary** — **[DS]** (BTN-VAR-02)
- **[CODE] caveat** (BTN-ACC-05) `loading` provides no built-in `aria-busy` ...
```

and the inline prose tag in the Variants intro:

```markdown
Providing the variants is **[CODE]** (BTN-VAR-01); the use / don't-use guidance
is **[DS]** — the component cannot know a button's semantic role.
```

The second tag on that line stays without an ID: it labels the guidance that BTN-VAR-02..08 already cover.

- [ ] **Step 6: Verify every tag has an ID**

```bash
grep -cE '\*\*\[(CODE|DS \+ CODE|DS)\][^*]*\*\* \([A-Z]{3}-[A-Z]{3}-[0-9]{2}\)' ../md_design/button.md
```

Expected: `42`.

Then confirm nothing was missed — this lists tags with no following ID, which should return only the three Legend definitions and the second tag in the Variants intro:

```bash
grep -nE '\*\*\[(CODE|DS \+ CODE|DS)\][^*]*\*\*(?! \()' ../md_design/button.md
```

- [ ] **Step 7: Commit**

`md_design/` is outside the repository and unversioned, so there is nothing to commit for this task. Confirm the file is saved and move on. (Recorded as an open item in the design document.)

---

### Task 4: Coverage script

**Files:**
- Create: `src/tests/tools/check-spec-coverage.ts`
- Modify: `package.json` (scripts)
- Test: manual run (the script is itself the check)

**Interfaces:**
- Consumes: rule IDs from Task 3.
- Produces: `yarn check:spec-coverage` — exits 0 when every spec ID is referenced by a test and every test ID exists in the spec.

- [ ] **Step 1: Write the script**

Create `src/tests/tools/check-spec-coverage.ts`:

```ts
import {readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import fg from 'fast-glob';

interface SpecRule {
  id: string;
  tag: string;
  line: number;
}

interface TestRef {
  id: string;
  kind: 'test' | 'todo';
  file: string;
}

const TAG = String.raw`\*\*\[(CODE|DS \+ CODE|DS)\][^*]*\*\*`;
const ID = String.raw`([A-Z]{3}-[A-Z]{3}-\d{2})`;
const RULE_RE = new RegExp(`${TAG}\\s*\\(${ID}\\)`, 'g');
const BARE_TAG_RE = new RegExp(`${TAG}(?!\\s*\\()`, 'g');
const TEST_RE = /\b(it\.todo|it\.each\([\s\S]*?\)|it|describe)\s*\(\s*[`'"]([^`'"]+)/g;
const ID_IN_TITLE_RE = /[A-Z]{3}-[A-Z]{3}-\d{2}/g;

const specPath = process.argv[2] ?? '../md_design/button.md';
const testsRoot = resolve(process.cwd(), 'src/tests');

const readSpec = (path: string): {rules: SpecRule[]; untagged: number[]} => {
  const text = readFileSync(resolve(process.cwd(), path), 'utf8');
  const lines = text.split('\n');
  const legendStart = lines.findIndex((l) => l.startsWith('### Legend'));
  const legendEnd = lines.findIndex((l, i) => i > legendStart && l.startsWith('## '));

  const rules: SpecRule[] = [];
  const untagged: number[] = [];

  lines.forEach((line, index) => {
    const inLegend = legendStart >= 0 && index >= legendStart && index < legendEnd;

    for (const match of line.matchAll(RULE_RE)) {
      rules.push({id: match[2] ?? '', tag: match[1] ?? '', line: index + 1});
    }

    if (!inLegend) {
      for (const _ of line.matchAll(BARE_TAG_RE)) {
        untagged.push(index + 1);
      }
    }
  });

  return {rules, untagged};
};

const readTests = (): TestRef[] => {
  const files = fg.sync('**/*.spec.ts', {cwd: testsRoot});
  const refs: TestRef[] = [];

  for (const file of files) {
    const text = readFileSync(join(testsRoot, file), 'utf8');

    for (const match of text.matchAll(TEST_RE)) {
      const kind = match[1] === 'it.todo' ? 'todo' : 'test';

      for (const id of (match[2] ?? '').match(ID_IN_TITLE_RE) ?? []) {
        refs.push({id, kind, file});
      }
    }
  }

  return refs;
};

const {rules, untagged} = readSpec(specPath);
const refs = readTests();
const refIds = new Set(refs.map((r) => r.id));
const ruleIds = new Set(rules.map((r) => r.id));

const uncovered = rules.filter((r) => !refIds.has(r.id));
const stale = refs.filter((r) => !ruleIds.has(r.id));

console.log(`spec rules: ${rules.length}   test references: ${refs.length}`);

for (const rule of rules) {
  const kinds = [...new Set(refs.filter((r) => r.id === rule.id).map((r) => r.kind))];
  const where = kinds.length > 0 ? kinds.sort().join('+') : 'MISSING';
  console.log(`  ${rule.id}  ${rule.tag.padEnd(9)}  ${where}`);
}

for (const rule of uncovered) {
  console.error(`ERROR ${rule.id} (spec line ${rule.line}) has no test or todo`);
}

for (const ref of stale) {
  console.error(`ERROR ${ref.id} referenced in ${ref.file} but absent from the spec`);
}

for (const line of untagged) {
  console.error(`ERROR spec line ${line} has a tag with no rule ID`);
}

const failures = uncovered.length + stale.length + untagged.length;

if (failures > 0) {
  console.error(`\n${failures} coverage problem(s)`);
  process.exit(1);
}

console.log('\nall spec rules are referenced');
```

`fast-glob` is already a devDependency, used by the existing `scripts/*.ts`.

An ID may legitimately be referenced by both a real test and a todo — `BTN-STA-01` covers six states, one of which (`pressed`) is not reachable. The report prints `test+todo` for that case rather than treating it as a conflict.

- [ ] **Step 2: Add the npm script**

In `package.json` `scripts`:

```json
"check:spec-coverage": "tsx src/tests/tools/check-spec-coverage.ts",
```

- [ ] **Step 3: Run it and confirm it reports every rule as missing**

```bash
yarn check:spec-coverage
```

Expected: exit code 1, 42 `MISSING` rows, and `42 coverage problem(s)`. No tests reference IDs yet, so this is the correct output — it is the worklist for Tasks 5–9.

- [ ] **Step 4: Confirm eslint accepts the file**

```bash
yarn lint:ts-src
```

If `eslint-plugin-compat` objects to Node APIs in a browser-targeted source tree, add an override for `src/tests/tools/**` in `eslint.config.js` disabling `compat/compat`. Do not move the file out of `src/tests`.

- [ ] **Step 5: Commit**

```bash
git add package.json src/tests/tools eslint.config.js
git commit -m "test: add spec rule coverage checker"
```

---

### Task 5: Geometry conformance — layout, shapes, typography

**Files:**
- Create: `src/tests/button/button.geometry.spec.ts`

**Interfaces:**
- Consumes: `mountButton` from `helpers/mount`, `isZeroLetterSpacing` from `helpers/styles`.
- Produces: coverage of BTN-LAY-02, BTN-LAY-03, BTN-LAY-04, BTN-SHP-01, BTN-SHP-02, BTN-TYP-01, BTN-TYP-02, BTN-TYP-03, BTN-TYP-04.

- [ ] **Step 1: Write the spec file**

Create `src/tests/button/button.geometry.spec.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {BUTTON_VARIANT, SIZE} from '@ndw-ui-kit/core';
import type {ButtonVariant, Size} from '@ndw-ui-kit/core';
import {mountButton} from '../helpers/mount';
import {isZeroLetterSpacing} from '../helpers/styles';

describe('button geometry', () => {
  it.each<[Size, string]>([
    [SIZE.S, '48px'],
    [SIZE.L, '64px'],
    [SIZE.XL, '96px'],
    [SIZE.XXL, '120px'],
  ])('BTN-LAY-03 — size %s has a minimum width of %s', (size, expected) => {
    const {styles} = mountButton({size});

    expect(styles().minWidth).toBe(expected);
  });

  it.each<[Size, string]>([
    [SIZE.S, '24px'],
    [SIZE.L, '32px'],
    [SIZE.XL, '44px'],
    [SIZE.XXL, '56px'],
  ])('BTN-LAY-04 — size %s has a fixed height of %s', (size, expected) => {
    const {styles} = mountButton({size});

    expect(styles().height).toBe(expected);
  });

  it('BTN-LAY-02 — resolves to XL when no size is set', () => {
    const {host, styles} = mountButton({size: undefined});

    expect(host.classList.contains('ndwu-button--XL')).toBe(true);
    expect(styles().height).toBe('44px');
  });

  it.each<[Size, string]>([
    [SIZE.S, '4px'],
    [SIZE.L, '6px'],
    [SIZE.XL, '8px'],
    [SIZE.XXL, '8px'],
  ])('BTN-SHP-01 — size %s has a border radius of %s', (size, expected) => {
    const {styles} = mountButton({size});

    expect(styles().borderTopLeftRadius).toBe(expected);
    expect(styles().borderBottomRightRadius).toBe(expected);
  });

  it.each<ButtonVariant>([
    BUTTON_VARIANT.PRIMARY,
    BUTTON_VARIANT.SECONDARY,
    BUTTON_VARIANT.TERTIARY,
    BUTTON_VARIANT.GHOST,
    BUTTON_VARIANT.SECONDARY_NEGATIVE,
  ])('BTN-SHP-02 — variant %s uses a 1px border', (variant) => {
    const {styles} = mountButton({variant});

    expect(styles().borderTopWidth).toBe('1px');
    expect(styles().borderRightWidth).toBe('1px');
    expect(styles().borderBottomWidth).toBe('1px');
    expect(styles().borderLeftWidth).toBe('1px');
  });

  it('BTN-TYP-01 — uses Roboto with the documented fallbacks', () => {
    const {styles} = mountButton();

    expect(styles().fontFamily).toBe('roboto, "Helvetica Neue", sans-serif');
  });

  it.each<Size>([SIZE.XL, SIZE.XXL])(
    'BTN-TYP-02 — size %s uses 16/24 with letter-spacing -0.1px',
    (size) => {
      const {styles} = mountButton({size});

      expect(styles().fontSize).toBe('16px');
      expect(styles().lineHeight).toBe('24px');
      expect(styles().letterSpacing).toBe('-0.1px');
    },
  );

  it.each<Size>([SIZE.S, SIZE.L])(
    'BTN-TYP-03 — size %s uses 12/17 with zero letter-spacing',
    (size) => {
      const {styles} = mountButton({size});

      expect(styles().fontSize).toBe('12px');
      expect(styles().lineHeight).toBe('17px');
      expect(isZeroLetterSpacing(styles().letterSpacing)).toBe(true);
    },
  );

  it('BTN-TYP-04 — the label does not wrap', () => {
    const {styles} = mountButton({label: 'A very long button label that would wrap'});

    expect(styles().whiteSpace).toBe('nowrap');
  });
});
```

- [ ] **Step 2: Run the suite**

```bash
yarn test:conformance
```

Expected: 24 geometry tests execute. **Do not fix any failure by editing `src/lib`.** For each failure, record the ID, the expected value from the specification, and the actual value — Task 10 turns these into findings.

- [ ] **Step 3: Commit**

```bash
git add src/tests/button/button.geometry.spec.ts
git commit -m "test: add button geometry conformance specs"
```

---

### Task 6: Appearance conformance — colours and elevation

**Files:**
- Create: `src/tests/button/button.appearance.spec.ts`

**Interfaces:**
- Consumes: `mountButton` from `helpers/mount`, `hexToRgb` from `helpers/styles`, `userEvent` from `@vitest/browser/context`.
- Produces: coverage of BTN-CLR-01, BTN-CLR-02, BTN-ELV-02, BTN-ELV-03.

- [ ] **Step 1: Write the spec file**

Create `src/tests/button/button.appearance.spec.ts`:

```ts
import {userEvent} from '@vitest/browser/context';
import {describe, expect, it} from 'vitest';
import {BUTTON_VARIANT} from '@ndw-ui-kit/core';
import {mountButton} from '../helpers/mount';
import {hexToRgb} from '../helpers/styles';

describe('button appearance', () => {
  it('BTN-CLR-01 — primary resolves its default background from the token set', () => {
    const {styles} = mountButton({variant: BUTTON_VARIANT.PRIMARY});

    expect(styles().backgroundColor).toBe(hexToRgb('#007bbe'));
    expect(styles().color).toBe(hexToRgb('#ffffff'));
  });

  it('BTN-CLR-01 — secondary resolves its default surface and border from the token set', () => {
    const {styles} = mountButton({variant: BUTTON_VARIANT.SECONDARY});

    expect(styles().backgroundColor).toBe(hexToRgb('#ffffff'));
    expect(styles().borderTopColor).toBe(hexToRgb('#58ace8'));
  });

  it('BTN-CLR-02 — disabled uses dedicated tokens rather than opacity', () => {
    const {styles} = mountButton({variant: BUTTON_VARIANT.PRIMARY, disabled: true});

    expect(styles().backgroundColor).toBe(hexToRgb('#797d89'));
    expect(styles().color).toBe(hexToRgb('#f0f2f4'));
    expect(styles().opacity).toBe('1');
  });

  it('BTN-ELV-03 — a resting button has no elevation', () => {
    const {styles} = mountButton();

    expect(styles().boxShadow).toBe('none');
    expect(styles().filter).toBe('none');
  });

  it('BTN-ELV-02 — keyboard focus renders the primary focus ring', async () => {
    const {host, styles} = mountButton({variant: BUTTON_VARIANT.PRIMARY});

    await userEvent.tab();

    expect(document.activeElement).toBe(host);

    // fx-focused-primary: focus colour at spread 3, plus white at spread 1.
    expect(styles().boxShadow).toContain(hexToRgb('#007bbe'));
    expect(styles().boxShadow).toContain('0px 0px 0px 3px');
    expect(styles().boxShadow).toContain('inset');
  });

  it('BTN-ELV-02 — keyboard focus renders the default focus ring on secondary', async () => {
    const {host, styles} = mountButton({variant: BUTTON_VARIANT.SECONDARY});

    await userEvent.tab();

    expect(document.activeElement).toBe(host);

    // fx-focused-default: focus colour at spread 2.
    expect(styles().boxShadow).toContain(hexToRgb('#007bbe'));
    expect(styles().boxShadow).toContain('0px 0px 0px 2px');
  });
});
```

Focus is driven with a real `Tab` press, not `element.focus()`. The ring lives on `:focus-visible` (`ndwu-button.mixins.scss:59`), and Chromium decides `:focus-visible` from the last input modality — programmatic focus does not reliably match it.

The spread assertions encode the **specification** (`fx-focused-primary` = spread 3 plus white spread 1). The implementation's token is `inset 0 0 0 1px` white plus `0 0 0 2px` brand. If that test fails, it is a genuine divergence — record it, do not change the token.

- [ ] **Step 2: Run the suite**

```bash
yarn test:conformance
```

Expected: 6 appearance tests execute. Record failures; change nothing under `src/lib`.

- [ ] **Step 3: Commit**

```bash
git add src/tests/button/button.appearance.spec.ts
git commit -m "test: add button colour and elevation conformance specs"
```

---

### Task 7: Behaviour conformance — variants, composition, states

**Files:**
- Create: `src/tests/button/button.behavior.spec.ts`

**Interfaces:**
- Consumes: `mountButton` from `helpers/mount`, `ICON_NAME` and `BUTTON_VARIANT` from `@ndw-ui-kit/core`.
- Produces: coverage of BTN-VAR-01, BTN-CMP-01, BTN-CMP-02, BTN-STA-01, BTN-STA-02, BTN-STA-03.

- [ ] **Step 1: Write the spec file**

Create `src/tests/button/button.behavior.spec.ts`:

```ts
import {userEvent} from '@vitest/browser/context';
import {describe, expect, it} from 'vitest';
import {BUTTON_VARIANT, ICON_NAME} from '@ndw-ui-kit/core';
import {mountButton} from '../helpers/mount';

describe('button behaviour', () => {
  it('BTN-VAR-01 — the component exposes the coded variant set', () => {
    expect(Object.values(BUTTON_VARIANT)).toEqual([
      'primary',
      'secondary',
      'tertiary',
      'ghost',
      'secondary-negative',
    ]);
  });

  it('BTN-CMP-01 — renders an icon slot and a label slot', () => {
    const {host} = mountButton({icon: ICON_NAME.ADD_L, label: 'Add'});

    expect(host.querySelector('ndwu-icon')).not.toBeNull();
    expect(host.textContent).toContain('Add');
  });

  it('BTN-CMP-01 — renders projected content when no label input is set', () => {
    const {host} = mountButton({label: '', content: 'Projected'});

    expect(host.textContent).toContain('Projected');
  });

  it('BTN-CMP-02 — loading hides the icon, shows the loader, keeps the label', () => {
    const {host, update} = mountButton({icon: ICON_NAME.ADD_L, label: 'Add'});

    expect(host.querySelector('ndwu-icon')).not.toBeNull();
    expect(host.querySelector('ndwu-spokes-loader')).toBeNull();

    update({loading: true});

    expect(host.querySelector('ndwu-icon')).toBeNull();
    expect(host.querySelector('ndwu-spokes-loader')).not.toBeNull();
    expect(host.textContent).toContain('Add');
  });

  it('BTN-STA-01 — the default state carries the variant and size classes', () => {
    const {host} = mountButton();

    expect(host.classList.contains('ndwu-button')).toBe(true);
    expect(host.classList.contains('ndwu-button--primary')).toBe(true);
    expect(host.classList.contains('ndwu-button--XL')).toBe(true);
  });

  it('BTN-STA-01 — hover changes the rendered background', async () => {
    const {host, styles} = mountButton({variant: BUTTON_VARIANT.PRIMARY});
    const resting = styles().backgroundColor;

    await userEvent.hover(host);

    expect(styles().backgroundColor).not.toBe(resting);
  });

  it('BTN-STA-01 — the disabled and loading states are reflected as classes', () => {
    const {host, update} = mountButton();

    update({disabled: true});
    expect(host.classList.contains('ndwu-button--disabled')).toBe(true);

    update({disabled: false, loading: true});
    expect(host.classList.contains('ndwu-button--loading')).toBe(true);
  });

  it('BTN-STA-02 — disabled uses the native attribute and not-allowed cursor', () => {
    const {host, styles} = mountButton({disabled: true});

    expect(host.disabled).toBe(true);
    expect(styles().cursor).toBe('not-allowed');
  });

  it('BTN-STA-02 — a disabled button cannot be activated', () => {
    const {host} = mountButton({disabled: true});
    let clicks = 0;
    host.addEventListener('click', () => {
      clicks += 1;
    });

    // Programmatic click, not userEvent: Playwright waits for actionability on a
    // disabled element and would stall the test rather than fail it.
    host.click();

    expect(clicks).toBe(0);
  });

  it('BTN-STA-03 — loading blocks pointer events without setting native disabled', () => {
    const {host, styles} = mountButton({loading: true});

    expect(styles().pointerEvents).toBe('none');
    expect(host.disabled).toBe(false);
    expect(host.getAttribute('aria-busy')).toBeNull();
  });
});
```

`BTN-STA-03` asserts the *absence* of `disabled` and `aria-busy` because the specification documents that absence explicitly, together with its accessibility caveat. A future change that adds `aria-busy` should fail this test and prompt a specification update — that is the intended signal, not a bug.

- [ ] **Step 2: Run the suite**

```bash
yarn test:conformance
```

Expected: 10 behaviour tests execute. Record failures; change nothing under `src/lib`.

- [ ] **Step 3: Commit**

```bash
git add src/tests/button/button.behavior.spec.ts
git commit -m "test: add button behaviour conformance specs"
```

---

### Task 8: Accessibility conformance

**Files:**
- Create: `src/tests/button/button.a11y.spec.ts`

**Interfaces:**
- Consumes: `mountButton` from `helpers/mount`, `userEvent` from `@vitest/browser/context`.
- Produces: coverage of BTN-ACC-01, BTN-ACC-03, BTN-ACC-04, BTN-ACC-05, BTN-DOD-04.

- [ ] **Step 1: Write the spec file**

Create `src/tests/button/button.a11y.spec.ts`:

```ts
import {userEvent} from '@vitest/browser/context';
import {describe, expect, it} from 'vitest';
import {mountButton} from '../helpers/mount';

describe('button accessibility', () => {
  it('BTN-ACC-01 — no accessible name is invented for a text-less button', () => {
    const {host} = mountButton({label: '', content: ''});

    expect(host.getAttribute('aria-label')).toBeNull();
    expect(host.getAttribute('aria-labelledby')).toBeNull();
    expect(host.textContent?.trim()).toBe('');
  });

  it('BTN-ACC-01 — the label input is visible text and is not mapped to aria-label', () => {
    const {host} = mountButton({label: 'Save'});

    expect(host.textContent).toContain('Save');
    expect(host.getAttribute('aria-label')).toBeNull();
  });

  it('BTN-DOD-04 — the host is a native button of type="button"', () => {
    const {host} = mountButton();

    expect(host.tagName).toBe('BUTTON');
    expect(host.getAttribute('type')).toBe('button');
  });

  it('BTN-ACC-03 — the native button is focusable without an explicit tabindex', () => {
    const {host} = mountButton();

    expect(host.getAttribute('tabindex')).toBeNull();
    host.focus();
    expect(document.activeElement).toBe(host);
  });

  it('BTN-ACC-03 — a disabled button is not focusable', () => {
    const {host} = mountButton({disabled: true});

    host.focus();

    expect(document.activeElement).not.toBe(host);
  });

  it('BTN-ACC-04 — TAB moves focus to the button', async () => {
    const {host} = mountButton();

    await userEvent.tab();

    expect(document.activeElement).toBe(host);
  });

  it.each<['{Enter}' | ' ', string]>([
    ['{Enter}', 'ENTER'],
    [' ', 'SPACE'],
  ])('BTN-ACC-04 — %s activates the button (%s)', async (key) => {
    const {host} = mountButton();
    let clicks = 0;
    host.addEventListener('click', () => {
      clicks += 1;
    });

    await userEvent.tab();
    await userEvent.keyboard(key);

    expect(clicks).toBe(1);
  });

  it('BTN-ACC-05 — loading sets no aria-busy and does not block keyboard activation', async () => {
    const {host} = mountButton({loading: true});
    let clicks = 0;
    host.addEventListener('click', () => {
      clicks += 1;
    });

    expect(host.getAttribute('aria-busy')).toBeNull();

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(clicks).toBe(1);
  });
});
```

The last test encodes the specification's own caveat: `loading` does not stop keyboard activation. A pass confirms the documented caveat is accurate; a failure means the component changed and the specification is now stale.

- [ ] **Step 2: Run the suite**

```bash
yarn test:conformance
```

Expected: 9 accessibility tests execute. Record failures; change nothing under `src/lib`.

- [ ] **Step 3: Commit**

```bash
git add src/tests/button/button.a11y.spec.ts
git commit -m "test: add button accessibility conformance specs"
```

---

### Task 9: Blank tests for rules that cannot be tested

**Files:**
- Create: `src/tests/button/button.todo.spec.ts`

**Interfaces:**
- Consumes: rule IDs from Task 3.
- Produces: coverage of every remaining ID — BTN-CLR-03, BTN-LAY-01, BTN-LAY-05, BTN-ELV-01, BTN-SHP-03, BTN-VAR-02..09, BTN-ACC-02, BTN-DOD-01, BTN-DOD-02, BTN-DOD-03, BTN-DOD-05, plus the `pressed` portion of BTN-STA-01. After this task `yarn check:spec-coverage` exits 0.

- [ ] **Step 1: Write the spec file**

Create `src/tests/button/button.todo.spec.ts`:

```ts
import {describe, it} from 'vitest';

/**
 * Every rule in md_design/button.md is referenced by a test. The rules below
 * cannot be asserted, for one of three reasons. Each todo names the reason so
 * that a blank test is never mistaken for missing coverage.
 */

describe('[DS] not enforceable by the component', () => {
  it.todo('BTN-CLR-03 — negative colour is reserved for risky or destructive actions');
  it.todo('BTN-LAY-01 — size guide: which size suits which context');
  it.todo('BTN-VAR-02 — primary: single most important action, once per screen');
  it.todo('BTN-VAR-03 — secondary: supporting or alternative actions');
  it.todo('BTN-VAR-04 — tertiary: least important actions, never deletion');
  it.todo('BTN-VAR-05 — ghost: safe actions, used as a link analogue');
  it.todo('BTN-VAR-06 — negative: irreversible actions, exceptional use only');
  it.todo('BTN-VAR-07 — positive: encouraging actions needing no immediate reaction');
  it.todo('BTN-VAR-08 — warning: warnings that need the user\'s attention');
  it.todo('BTN-VAR-09 — the documented negative/critical usage list');
  it.todo('BTN-ACC-02 — aria-pressed belongs to a consumer owning toggle state');
  it.todo('BTN-DOD-01 — exactly one primary button per screen or modal');
  it.todo('BTN-DOD-02 — no tertiary or negative styling for frequent actions');
});

describe('[SPEC GAP] cannot be tested as written', () => {
  it.todo('BTN-LAY-05 — per-size padding: the spec states no values (code has 6/8, 8/12, 4/16, 8/20)');
  it.todo('BTN-ELV-01 — hover drop-shadow: "subtle", no token or value given (code: drop-shadow(1px 1px 2px -1px #00000024))');
  it.todo('BTN-SHP-03 — ghost/tertiary border "transparent OR token-driven": two acceptable outcomes');
  it.todo('BTN-DOD-03 — duplicates BTN-ACC-01; one rule should not hold two IDs');
  it.todo('BTN-DOD-05 — positive/warning exist in Figma but not in BUTTON_VARIANT; unresolved in the spec');
});

describe('[HARNESS LIMIT] well specified, not reachable by this tooling', () => {
  it.todo('BTN-STA-01 — pressed (:active) requires holding a pointer across the assertion');
});
```

- [ ] **Step 2: Run the suite**

```bash
yarn test:conformance
```

Expected: 19 todo entries reported alongside the executed tests.

- [ ] **Step 3: Attempt the pressed state once before accepting the harness limit**

Add this temporarily to `button.behavior.spec.ts` and run it three times:

```ts
it('BTN-STA-01 — pressed changes the rendered background', async () => {
  const {host, styles} = mountButton();
  const resting = styles().backgroundColor;

  await userEvent.hover(host);
  host.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));

  expect(styles().backgroundColor).not.toBe(resting);
});
```

If it passes three times in a row, keep it and delete the `[HARNESS LIMIT]` todo. If it fails or is intermittent, delete this test and keep the todo — a synthetic `pointerdown` does not put Chromium into the `:active` state, which is exactly the limitation the todo records.

- [ ] **Step 4: Run the coverage checker**

```bash
yarn check:spec-coverage
```

Expected: exit code 0, `all spec rules are referenced`, 42 rows with no `MISSING`.

If any row reads `MISSING`, add the todo or test for that ID before continuing.

- [ ] **Step 5: Commit**

```bash
git add src/tests/button/button.todo.spec.ts
git commit -m "test: add blank tests for untestable button spec rules"
```

---

### Task 10: Findings report

**Files:**
- Create: `src/tests/button/FINDINGS.md`

**Interfaces:**
- Consumes: the full suite run.
- Produces: the audit deliverable — every divergence and every specification defect, each with a recommendation.

- [ ] **Step 1: Capture a full run**

```bash
yarn test:conformance 2>&1 | tee /tmp/button-conformance.log
```

- [ ] **Step 2: Write the report**

Create `src/tests/button/FINDINGS.md` with this structure. Fill every row from the actual run — no row is written from expectation.

```markdown
# Button spec conformance — findings

Spec: `md_design/button.md` · Component: `NdwuButtonComponent`
Run: <date> · <N> passed · <N> failed · <N> todo

## Code divergences — implementation differs from the specification

| Rule | Expected (spec) | Actual (code) | Recommendation |
|---|---|---|---|
| BTN-… | … | … | fix code / fix spec |

## Specification defects — rules that could not be tested

| Rule | Problem | Suggested spec edit |
|---|---|---|
| BTN-LAY-05 | Padding stated without values | Add the four value pairs the code already uses: S 6/8, L 8/12, XL 4/16, XXL 8/20 |
| BTN-ELV-01 | "Subtle drop-shadow", no value | State the shadow, or name a token for it |
| BTN-SHP-03 | "Transparent or token-driven" | Pick one; "or" cannot be asserted |
| BTN-DOD-03 | Duplicates BTN-ACC-01 | Make it a cross-reference, not a second rule |
| BTN-DOD-05 | positive/warning unresolved | Decide whether the kit surfaces them |
| BTN-ELV-03 | Was the only untagged rule (tagged [CODE] during this work) | Confirm the tag is correct |

## Not enforceable by the component

13 `[DS]` rules, listed in `button.todo.spec.ts`. No action; recorded so that
absence of a test is never read as absence of coverage.

## Harness limits

| Rule | Limit |
|---|---|
| BTN-STA-01 (pressed) | `:active` needs a pointer held across the assertion |
```

- [ ] **Step 3: Verify every failing test appears in the report**

```bash
grep -cE "^\s*(×|✗|FAIL)" /tmp/button-conformance.log
```

Compare that count against the number of rows in the "Code divergences" table. They must match. A failure absent from the report is the one failure mode this whole exercise exists to prevent.

- [ ] **Step 4: Commit**

```bash
git add src/tests/button/FINDINGS.md
git commit -m "docs: record button spec conformance findings"
```

# Codestyle Conventions

This project follows the
[Angular Style Guide](https://angular.io/guide/styleguide).
Where the rules below conflict with the Angular Style Guide,
these rules take precedence. ESLint enforces many of these
rules automatically.

## General Formatting

- **Indentation:** 2 spaces (no tabs).
- **Quotes:** single quotes everywhere.
- **Semicolons:** required.
- **Trailing whitespace:** not allowed.
- **Final newline:** required in every file.
- **Object braces:** no spaces inside (`{foo}`,
  not `{ foo }`).
- **Max function length:** 75 lines (warning, not a hard requirement).
- **Blank lines:** required before `return` and around
  block-like statements / variable declarations.
- **Chained calls:** newline per chained call (warning).
- **Arrow functions:** use explicit curly braces and `return`
  for multi-line bodies, even if the return value is implicit.

### `@dprint-ignore`

The project uses [dprint](https://dprint.dev/) as its code
formatter. When dprint's automatic formatting would break
readability — e.g. collapsing a deliberately split chain
into one line, or wrapping a long generic signature in an
unhelpful way — place a `// @dprint-ignore` comment on the
line immediately before the statement to preserve its
manual formatting:

```typescript
// @dprint-ignore
const strategy = this.overlay.position().global()
  .bottom();

// @dprint-ignore
protected readonly dialog = viewChild
  .required<TemplateRef<Context>>('dialog');
```

Use sparingly — only when the formatter's output is
genuinely less readable than the hand-formatted version.

## TypeScript

### Strict Configuration

The project extends `@tsconfig/strictest`. Key flags:

- `strictNullChecks` — on
- `strictTemplates` — on
- `strictInputAccessModifiers` — on
- `useDefineForClassFields` — on (see
  [Class Property Initialization](#class-property-initialization))
- Target: ES2022

### Access Modifiers

Explicit access modifiers (`public`, `protected`, `private`)
are **required** on all class members. The only exception is
constructors, which must **not** have the `public` keyword.

```typescript
// Correct
export class MyComponent {
  public readonly name = 'foo';
  private count = 0;
  protected helper = inject(HelperService);

  constructor() {}
}
```

### Non-null Assertions

The `!` (non-null assertion) operator is **banned**. Use
proper null checks or `assertIsDefined()` instead.

### `console` Usage

- `console.log` is **banned**.
- `console.warn` and `console.error` are allowed.

### Banned Identifiers

Short names `e`, `cb`, `x` are banned as variable names
(relaxed in coordinate-related files where `x`/`y` are
natural).

### `prefer-const` and `no-var`

Always use `const` when the binding is never reassigned.
`var` is not allowed.

### Class Property Initialization

Because `useDefineForClassFields` is enabled, class
properties **cannot** reference constructor parameters or
other instance properties at declaration time. Initialize
them in the constructor body instead:

```typescript
// WRONG — this.myService is undefined at field init time
class MyComponent {
  public readonly data = this.myService.getData();

  constructor(
    private myService: MyService,
  ) {}
}

// CORRECT
class MyComponent {
  public readonly data: Data;

  constructor(
    private myService: MyService,
  ) {
    this.data = this.myService.getData();
  }
}
```

**Exception:** fields may be initialized with static method
calls, library function calls, or constants:

```typescript
export class MyComponent {
  public readonly ITEMS = Object.values(ITEM_TYPE);
  public readonly LINK = SomeService.getLink(PAGE.HOME);
}
```

### Dependency Injection

Prefer `inject()` over constructor DI in new code. This
avoids `useDefineForClassFields` conflicts and simplifies
inheritance.

```typescript
// Preferred
@Component({...})
export class MyComponent {
  private readonly myService = inject(MyService);
  private readonly route = inject(ActivatedRoute);
  public readonly data: { name: string } =
    inject(SOME_TOKEN, {optional: true});
}
```

### Generics over Type Casting

When TypeScript cannot infer the correct type (e.g. with
Lodash or RxJS methods returning `any`), prefer explicit
generics over `as` casts:

```typescript
// Preferred
const items = _.get<Source, string, Item[]>(obj, 'key', []);
const data = of<Item[]>([]);

// Avoid
const items = _.get(obj, 'key', []) as Item[];
```

### `satisfies` Operator

Use `satisfies` instead of type annotations (`: Type`) when
you need both type validation **and** preserved literal
types:

```typescript
// Preserves literal types + validates structure
export const STATUS_L10N = {
  [STATUS.OK]: 'status.ok',
  [STATUS.ERR]: 'status.error',
} as const satisfies Record<Status, string>;
```

Use `: Type` when the value will be mutated or when literal
types are not needed.

### Lodash vs Native JavaScript

Prefer native JS methods over Lodash when a direct
equivalent exists:

- `_.map` → `array.map(fn)`
- `_.filter` → `array.filter(fn)`
- `_.groupBy` → `Object.groupBy(array, fn)`
- `_.uniq` → `[...new Set(array)]`
- `_.get(obj, 'a.b.c')` → `obj?.a?.b?.c`

Use Lodash only when no native equivalent exists
(e.g. `_.debounce`, `_.throttle`, deep merge).

When using `_.chain`, put `_` and `.chain(...)` on
separate lines:

```typescript
const result = _
  .chain(items)
  .flatMap(fn)
  .sortBy('key')
  .value();
```

### String Literal Types in Templates

For `as const` objects that produce string literal union
types (e.g. `SvgIconName`), use direct values or the
constant object in templates — never wrap in quotes via
`[prop]="'value'"` or interpolation, as this bypasses
type checking:

```html
<!-- Correct: direct value -->
<ndwu-icon icon="folder"></ndwu-icon>

<!-- Correct: property binding with constant -->
<ndwu-icon
  [icon]="condition
    ? ICON_NAME.CLOSE
    : ICON_NAME.MENU"
></ndwu-icon>

<!-- WRONG: string in binding loses type safety -->
<ndwu-icon [icon]="'folder'"></ndwu-icon>
```

## Angular

### Component Configuration

- **Change detection:** always use
  `ChangeDetectionStrategy.OnPush`.
- **Standalone:** components are standalone (no NgModules);
  dependencies go in the `imports` array.
- **Selector prefix:** `ndwu` for library components,
  `app` for playground/app components.
- **Element selectors:** `kebab-case`.
- **Attribute selectors (directives):** `camelCase`.

### Subscription Cleanup

Use `takeUntilDestroyed()` for subscription cleanup in
components and directives.

### Observable Subscriptions inside `effect()`

**Do not** subscribe to Observables inside `effect()` —
each re-run creates a new subscription, leaking the
previous one. If unavoidable, clean up manually:

```typescript
effect((onCleanup) => {
  const id = this.activeId();
  const sub = this.valueChanges$
    .subscribe(v => this.handle(id, v));

  onCleanup(() => sub.unsubscribe());
});
```

### Template Interpolation

- Spaces inside `{{ }}`: always pad with spaces.
- Use template literals (`` ` ``) instead of string
  concatenation in template bindings (Angular 19.2+):

```html
<!-- Correct -->
{{ data.name }}
[style.left]="`${item.shift}%`"
[src]="`./assets/icons/${item.id}.svg`"

<!-- Wrong -->
{{data.name}}
[style.left]="item.shift + '%'"
```

### Dynamic Styles

Avoid `NgStyle` and `[ngClass]`. For 1–2 dynamic style
properties, use `[style.property]` binding:

```html
[style.color]="config.lineColor"
[style.left]="`${item.leftShift}%`"
```

For conditional classes, use `[class.name]` binding:

```html
[class.is-active]="isActive"
```

### RxJS `.pipe()` Formatting

Place `.pipe(` on a new line, aligned with the observable:

```typescript
// Correct
this.data$
  .pipe(
    filter(Boolean),
    map(item => item.name),
  )
  .subscribe(name => this.update(name));

// Wrong
this.data$.pipe(
  filter(Boolean),
  map(item => item.name),
).subscribe(name => this.update(name));
```

Avoid nested `.pipe()` calls — flatten the chain or
extract an intermediate observable instead:

```typescript
// Preferred: extract intermediate observable
const filtered$ = this.data$
  .pipe(filter(Boolean));

filtered$
  .pipe(switchMap(item => this.load(item.id)))
  .subscribe();

// Avoid: nested pipe
this.data$
  .pipe(
    switchMap(item =>
      this.load(item.id)
        .pipe(
          catchError(() => EMPTY),
        ),
    ),
  )
  .subscribe();
```

### `NdwDialogRef.$afterClosed` Formatting

When `$afterClosed` is followed by a `.pipe()` chain,
place it on a new line:

```typescript
// Correct
this.getConfirmModal()
  .$afterClosed
  .pipe(
    filter(Boolean),
    exhaustMap(() => this.onDelete()),
  )
  .subscribe(() => this.close());

// OK — no chain follows, keep inline
const proceed$ =
  this.dialogService.openConfirm('id').$afterClosed;
```



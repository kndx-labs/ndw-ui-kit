# 004 Generic adapter for lists of options

- Status: Accepted
- Date: 2026-05-26

## Context and Problem Statement

Projects that integrate `ndw-ui-kit` use a variety of data shapes for lists of options
passed to form controls (select, multi-select, radio buttons, etc.).
Currently, consumers must manually map domain arrays to `NdwuOption[]`
before passing them to ndw-ui-kit form controls.

We want `ndw-ui-kit` to allow consumers to pass their domain arrays directly, with minimal
boilerplate, while keeping component internals simple and consistent.

## Considered Options

1. **Keep `NdwuOption` as the only accepted option type** <br/>
   Rejected: this is inconvenient for consumers.
2. **Let components accept `unknown[]` and autodetect the shape.** <br/>
   Rejected: this would rely on fragile implicit behavior, remove TypeScript
   type safety, and could lead to production issues.
3. **Separate `valueProp` / `labelProp` / `disabledProp` inputs on each component.** <br/>
   Rejected: this would significantly expand the API surface, require every component
   to duplicate the same set of inputs, and provide no way to configure defaults project-wide.
4. **Introduce an `NdwuOptionAdapter<T>` contract + (optional) DI token for project-wide defaults.** <br/>
   Accepted: consumers of `ndw-ui-kit` can pass domain arrays directly to our components,
   provided they also supply an adapter; our components keep using `NdwuOption[]` internally.

## Decision Outcome

The following API was introduced:

### `NdwuOption` &mdash; standard option shape

```ts
export interface NdwuOption {
  value: string | number; // supports numeric identifiers without type coercion.
  label: string;
  secondaryText?: string;
  disabled?: boolean;
}
```

### `NdwuOptionAdapter<T>` &mdash; mapping from domain types

```ts
// For some item type T, a selector can be either:
export type NdwuOptionFieldSelector<T, R> =
  // - a string key of T, like 'id' or 'name'
  | Extract<keyof T, string>
  // - a function that computes the value, like (item) => item.id
  | ((item: T) => R);

export interface NdwuOptionAdapter<T> {
  value: NdwuOptionFieldSelector<T, string | number>;
  label: NdwuOptionFieldSelector<T, string>;
  secondaryText?: NdwuOptionFieldSelector<T, string | undefined>;
  disabled?: NdwuOptionFieldSelector<T, boolean | undefined>;
}
```

### Component inputs

Select, multi-select, and radio now accept:

```ts
options?: readonly T[]; // T defaults to NdwuOption
optionAdapter?: NdwuOptionAdapter<T>;
```

Minimal usage example with a domain type:

```ts
interface Country {
  id: number;
  title: string;
  inactive?: boolean;
}

const countries: Country[] = [
  {id: 1, title: 'Germany'},
  {id: 2, title: 'France', inactive: true},
];

const countryAdapter: NdwuOptionAdapter<Country> = {
  value: 'id',
  label: 'title',
  disabled: 'inactive',
};
```

```html
<ndwu-select-field
  label="Country"
  [options]="countries"
  [optionAdapter]="countryAdapter"
  formControlName="country"
/>
```

The component normalizes `countries` to internal `NdwuOption[]`, so consumers
can pass domain objects directly while component internals stay consistent.

When `optionAdapter` is omitted and `T = NdwuOption`, the component automatically
uses a built-in identity adapter (`{ value: 'value', label: 'label', ... }`).

### DI token for project-wide defaults

```ts
export const NDWU_OPTION_CONFIG: InjectionToken<NdwuOptionConfig<unknown> | null>;

export interface NdwuOptionConfig<T = unknown> {
  optionAdapter?: NdwuOptionAdapter<T>;
}
```

Resolution order: **explicit `optionAdapter` > DI `NDWU_OPTION_CONFIG` > built-in identity**.

DI-provided adapters do not retain compile-time type safety
(Angular DI cannot preserve generics); this is a documented
trade-off for project-wide convenience.

### Normalization helper

```ts
export function normalizeOptions<T>(
  items: readonly T[],
  adapter: NdwuOptionAdapter<T>,
): NdwuOption[];
```

Emits development-mode warnings for `null/undefined` values and duplicate option values.

### Adapter resolution helper

```ts
export function resolveOptionsAdapter<T>(
  explicitAdapter: NdwuOptionAdapter<T> | undefined,
  diConfig: NdwuOptionConfig<unknown> | null,
): NdwuOptionAdapter<T>;
```

A single function that returns effective option adapter for given component instance.
All three components use this helper internally.

### `NdwuMultiSelectDisplayContext` redesign

```ts
export interface NdwuMultiSelectDisplayContext<T = NdwuOption> {
  empty: boolean;
  selectedValues: readonly (string | number)[];
  normalizedOptions: readonly NdwuOption[];
  selectedOptions: readonly T[];
  allOptions: readonly T[];
}
```

Custom trigger templates receive both UI-ready `NdwuOption[]` values and the original
domain objects, allowing consumers to choose whichever representation is more convenient.

## Consequences

### Pros

- Consumers can pass domain arrays directly with a small adapter definition.
- Project-wide default adapter via DI &mdash; define once, use everywhere.
- The explicit `optionAdapter` input is type-safe (TypeScript checks selector
  keys against `T`).
- Components operate on a single, consistent internal shape (`NdwuOption[]`).

### Cons

- DI-provided adapters are not type-safe at compile time.
- There is no automatic shape inference beyond treating the input as `NdwuOption[]`
  when no adapter is provided.

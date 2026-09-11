# Naming Conventions

## Constants and Enums

- Named in `SCREAMING_SNAKE_CASE`.
- Enum members also in `SCREAMING_SNAKE_CASE`.
- Prefer singular nouns for enum names.

```typescript
// Correct
enum TRAFFIC_SHAPER_FIELD {
  IS_ENABLED = 'isEnabled',
  DOWNLOAD_LIMIT = 'downloadLimit',
}

// Wrong: plural name
enum SCHEDULE_ACTIONS { ... }
```

## Interfaces and Types

- `UpperCamelCase` (PascalCase), no prefixes or suffixes.
- Library-public types use the `Ndwu` prefix (e.g. `NdwuOption`, `NdwuOptionAdapter`).

```typescript
// Correct
interface SchedulePattern {
  /* ... */
}

type MacAddressMode = /* ... */;

// Wrong
interface IScheduleConfiguration {
  /* ... */
}

type TDslMode = /* ... */;
```

## Classes

Names in `UpperCamelCase`, including abbreviations (`DSLIspDb` → `DslIspDb`).

### UI Components (library)

Prefixed with `Ndwu`:

| Class                           | File                                   |
|---------------------------------|----------------------------------------|
| `NdwuMultiSelectFieldComponent` | `ndwu-multi-select-field.component.ts` |
| `NdwuHelperMessageComponent`    | `ndwu-helper-message.component.ts`     |

### Injection Tokens

`SCREAMING_SNAKE_CASE` with `NDWU_` prefix:

```typescript
export const NDWU_POPOVER_HOST = new InjectionToken <...>('NdwuPopoverHost');
```

### Token Files

Design token and DI token values go in `*.tokens.ts`
or `*.tokens.scss` files.

## Variables and Functions

- `camelCase` for variables and functions.
- Boolean variables: `isX`, `hasY`, `areZ`.
- Observable / Subscription variables: `$` suffix (e.g. `data$`, `sub$`).

## Files and Folders

- File names follow Angular Style Guide: `kebab-case`
  with type suffix (`.component.ts`, `.service.ts`, `.pipe.ts`).
- Folder names in `kebab-case`.
- Utility files: `<name>.utils.ts` or just `<name>.ts`.
- Barrel exports via `index.ts`.
- Secondary entry points use `ng-package.json` +
  `package.json`.
- Path aliases: `@ndw-ui-kit/core`,
  `@ndw-ui-kit/core/utils`, etc.

## CSS Classes

BEM methodology. Root class matches the component name in `kebab-case`
(without `-component`):

| Component class                 | Root CSS class             |
|---------------------------------|----------------------------|
| `NdwuPopoverHostComponent`      | `.ndwu-popover-host`       |
| `NdwuMultiSelectFieldComponent` | `.ndwu-multi-select-field` |

Element: `__element`, modifier: `--modifier`.

```css
.ndwu-input {
  // ...
}

.ndwu-input--invalid {
  // ...
}

.ndwu-input__error {
  // ...
}
```

See [CSS.md](CSS.md) for full SCSS conventions.

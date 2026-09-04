# SCSS / CSS Conventions

## BEM Naming

CSS classes follow BEM methodology:

- Block: component name in `kebab-case` (e.g. `.ndwu-checkbox`)
- Element: `__element` (e.g. `.ndwu-checkbox__input`)
- Modifier: `--modifier` (e.g. `.ndwu-checkbox__input--disabled`)

Rules:

- Elements belong inside a block — never declare an
  element outside its block.
- Modifiers require the base element/block class alongside.
- Class names must **not** reflect DOM nesting (no `.block__el1__el2`).
- When encapsulation is off, avoid generic names
  (`header`, `title`, `footer`) — they leak.

### Nested Blocks

A component may contain sub-blocks. All sub-block styles
live in the same SCSS file:

```html
<table class="ndwu-table">
  <thead class="ndwu-table__header table-header">
    <tr class="table-header__row">
      <th class="table-header__cell">...</th>
    </tr>
  </thead>
</table>
```

## SCSS Structure

### Imports

Use `@use`, not `@import`.

### Nesting

- Keep nesting shallow — usually no more than 3 levels.
- Use `&__element` and `&--modifier`, but **do not**
  split a BEM name across multiple nesting levels:

```scss
// Correct
.search {
  &__result-block {
    &--loading { ... }
  }
}

// Wrong — splits "result-block" across nesting
.search {
  &__result {
    &-block {
      &--loading { ... }
    }
  }
}
```

### Declaration Order

All property declarations must come **before** nested
rule blocks, including `@include`:

```scss
// Correct
&__icon {
  position: absolute;
  cursor: pointer;

  @include mixins.flex-row();

  & > span {
    max-width: 180px;
  }
}

// Wrong — properties after @include
&__icon {
  @include mixins.flex-row();

  & {
    position: absolute;
    cursor: pointer;
  }
}
```

### Variables

Initialize SCSS variables at the top of the file, after
imports.

### Responsive Styles

Place media queries inline with the rule they modify,
not grouped at the end of the file:

```scss
.card {
  padding: $padding-4;

  @media #{$mobile} {
    padding: $padding-2;
  }
}
```

## Design Tokens

### Spacing and Padding

The project distinguishes between **padding** and
**spacing** tokens:

- `$padding-N` — for `padding` properties only.
- `$spacing-N` — for `gap`, `margin`, and layout spacing.

### Colors

Use CSS custom properties for colors:
`var(--ndwu-color-name)`. Light/dark theming is handled
through token files in `styles/themes/`.

### Typography

Tokens like `$fontSize-xxsmall`, `$letterSpacing-L`, etc.
are auto-generated from design tokens.

### Border Radius

Use `$radius-*` tokens from `styles/radius.scss`.

## Host Styling

Use `:host` for component host element styles.
Use `:host-context()` for contextual style variants.

```scss
:host {
  display: block;
}

:host-context(.compact) {
  padding: $padding-2;
}
```

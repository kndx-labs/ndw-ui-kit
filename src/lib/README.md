# NDW UI Kit

This repository contains a set of UI components for an Angular application.
It supports Angular 20.

## Installation

```shell
npm install @angular/cdk @ndw-ui-kit/core
```

```shell
yarn add @angular/cdk @ndw-ui-kit/core
```

```shell
pnpm add @angular/cdk @ndw-ui-kit/core
```

## Usage

### Including relevant assets in your project configuration

Components in the NDW UI kit rely on SCSS files shipped as part of the npm package.
You need to add these files in relevant parts of your project's `angular.json`
to ensure the components are styled correctly. The snippet below shows an example &mdash;
repeat the same `assets` and `styles` entries in each build configuration you use
(e.g. `development`, `production`):

```json5
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "projects": {
    "<YOUR_PROJECT_NAME>": {
      // ...
      "architect": {
        "build": {
          "options": {
            "assets": [
              // core icons sprite
              {
                "glob": "ndw-ui-kit.sprite.svg",
                "input": "node_modules/@ndw-ui-kit/core/assets",
                "output": "/assets/"
              },

              // pictogram icons sprite
              {
                "glob": "ndw-ui-kit.pictogram.sprite.svg",
                "input": "node_modules/@ndw-ui-kit/core/assets",
                "output": "/assets/"
              },
              // ... other assets
            ],
            "styles": [
              "./node_modules/@ndw-ui-kit/core/styles/themes.scss",
              // ... other styles
            ]
          }
          // Repeat the same assets/styles in each configuration block
        }
      }
    }
  }
}
```

The package exports `@ndw-ui-kit/core/styles/*` and `@ndw-ui-kit/core/assets/*`,
so other bundlers (e.g. Vite) can import them by package name without extra
`includePaths` or `loadPaths`:

```scss
@use '@ndw-ui-kit/core/styles/themes';
```

```ts
import spriteUrl from '@ndw-ui-kit/core/assets/ndw-ui-kit.sprite.svg?url';
```

### Theming

The NDW UI kit has two built-in themes: light and dark.
To switch between them, add or remove the `ndw-theme-dark` class on the root element:

```html

<body><!-- light theme is the default --></body>
<body class="ndw-theme-dark"><!-- dark theme --></body>
```

### Fonts

The NDW UI kit uses Roboto as the default font family. By default,
`@ndw-ui-kit/core/styles/themes.scss` does **not** emit Roboto
`@font-face` declarations. This avoids duplicating font assets when
your application already provides Roboto.

If you want the UI kit to emit Roboto `@font-face` rules, create a small wrapper
stylesheet in your app and configure the theme module with Sass `@use ... with (...)`:

```scss
// src/styles/ndw-ui-kit-theme.scss
@use '@ndw-ui-kit/core/styles/themes' with (
  $ndwu-emit-font-faces: true,
  $ndwu-roboto-font-base-path: '/assets/fonts/roboto'
);
```

Then include that wrapper stylesheet in your `angular.json` styles instead of pointing
directly to `node_modules/@ndw-ui-kit/core/styles/themes.scss`.

When enabling library-managed fonts, make sure the Roboto `.woff2` files are also copied
to the path referenced by `$ndwu-roboto-font-base-path`.

### Accessibility

The library ships an `aria` module (`@ndw-ui-kit/core/aria`) that provides
ARIA-compliant listbox and combobox primitives used internally by select/multiselect
components. These components produce appropriate `role`, `aria-*`, and keyboard-navigation
attributes out of the box &mdash; no additional configuration is required.

### Dialog and drawer custom slots

Dialogs and drawers support structural slot directives for replacing the container's
default header and footer regions:

- `*ndwuModalHeader`
- `*ndwuModalFooter`
- `ndwuModalActions`

#### Structural vs attribute usage

Use the structural form when you want to render content in the real outer modal container:

```html

<section *ndwuModalHeader>
  <h3>Custom header</h3>
</section>

<div ndwuModalBody>
  Body content
</div>

<div
  *ndwuModalFooter
  ndwuModalActions
>
  <button ndwuButton label="Cancel"></button>
</div>
```

Keep using the attribute form when you only need the built-in body/header/footer styles
inside already-rendered modal content:

```html

<div ndwuModalFooter>
  Styled footer content inside the modal body
</div>
```

Important difference:

- `*ndwuModalHeader` / `*ndwuModalFooter` &mdash; replace the container header/footer.
- `ndwuModalActions` &mdash; marks the real element inside a custom footer as its action row.
  It adds global action-row styles because custom footer content is projected into the
  outer dialog/drawer and consumer component-scoped selectors cannot style its buttons.
  On mobile, buttons stretch with a 16px gap. Default footers apply this automatically.
- `ndwuModalHeader` / `ndwuModalFooter` on a normal element &mdash; styling helper only
- `ndwuModalBody` &mdash; styling helper for the body area

Use `ndwuModalActions` with `*ndwuModalFooter` on a real element such as `div`; `ng-container`
has no host element for the action-row class.

When a custom slot is present:

- the default title/description header is not rendered for that modal instance
- `config.buttons` are not rendered when a custom footer slot is present
- the feature works for both dialogs and drawers

#### Component content example

```typescript
import {
  NDWU_MODAL_REF,
  NdwuButtonComponent,
  NdwuModalActionsDirective,
  NdwuModalFooterDirective,
  NdwuModalHeaderDirective,
  NdwuModalRef,
} from '@ndw-ui-kit/core';

@Component({
  // ...
  imports: [
    NdwuButtonComponent,
    NdwuModalActionsDirective,
    NdwuModalHeaderDirective,
    NdwuModalFooterDirective,
  ],
})
export class ProfileDialogComponent {
  constructor(
    @Inject(NDWU_MODAL_REF) protected readonly modalRef: NdwuModalRef<boolean>,
  ) {
  }
}
```

```html

<section *ndwuModalHeader>
  <h3 tabindex="0">Profile settings</h3>

  <button
    ndwuButton
    variant="secondary"
    label="Close"
    (click)="modalRef.close(false)"
  >
  </button>
</section>

<div>
  Dialog or drawer body content.
</div>

<div
  *ndwuModalFooter
  ndwuModalActions
>
  <button
    ndwuButton
    variant="secondary"
    label="Cancel"
    (click)="modalRef.close(false)"
  >
  </button>

  <button
    ndwuButton
    variant="primary"
    label="Save"
    (click)="modalRef.close(true)"
  >
  </button>
</div>
```

```typescript
this.modalService.openDialog(
  ProfileDialogComponent,
  {
    ariaLabel: 'Profile settings',
    hasCloseButton: false,
    width: '560px',
  },
);
```

The same component can also be opened with `openDrawer(...)`.

#### `ng-template` content example

```html

<ng-template #templateDialog let-modalRef="modalRef">
  <section *ndwuModalHeader>
    <h3>Template header</h3>
  </section>

  <div ndwuModalBody>
    Content rendered from an `ng-template`.
  </div>

  <div
    *ndwuModalFooter
    ndwuModalActions
  >
    <button
      ndwuButton
      variant="primary"
      label="Close"
      (click)="modalRef.close()"
    >
    </button>
  </div>
</ng-template>
```

```typescript
this.modalService.openTemplate(
  this.templateDialog(),
  {
    type: 'dialog',
    viewContainerRef: this.viewContainerRef,
    config: {
      ariaLabel: 'Template dialog with custom slots',
      hasCloseButton: false,
      width: '560px',
    },
  },
);
```

#### Accessibility guidance

If a custom header replaces the default title block, make sure the dialog/drawer still has
an accessible name:

- prefer explicit `ariaLabel`, or
- provide `ariaLabelledby` that points to an element rendered inside your custom header

If `title` is still provided and no explicit accessible-name override is set, the library
uses that title as a fallback accessible name for modals with a custom header slot.

### Icons

By default, `<ndwu-icon>` uses only the core sprite (`ndw-ui-kit.sprite.svg`).

#### Additional icons (full catalog)

If you need access to the full icon catalog (~330 extra icons), include the extra
sprite asset in `angular.json` (using `ndw-ui-kit.extra.sprite.svg`) and register
the provider:

```typescript
import {provideAllNdwUiKitIcons} from '@ndw-ui-kit/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAllNdwUiKitIcons(),
  ],
};
```

#### Custom sprite (subset of extra icons)

If you only need a small subset of extra icons, generate a custom sprite instead of
shipping the full extra sprite. This reduces your production bundle size while
preserving runtime checks inside `<ndwu-icon>`.

##### 1. Create an icon config file

```json
{
  "icons": [
    "wifi_signal_1_L",
    "wifi_signal_2_L",
    "usb_L"
  ]
}
```

Icon names are string values of `NDWU_EXTRA_ICON_NAME` exported from `@ndw-ui-kit/core`.
The CLI validates every name and exits an error for any unknown name.

##### 2. Generate the sprite

```shell
npx ndw-ui-kit-build-sprite --config src/my-icons.json --out src/assets/my-custom.sprite.svg
```

##### 3. Serve the generated sprite as a static asset

```json5
{
  "assets": [
    {
      "glob": "my-custom.sprite.svg",
      "input": "src/assets",
      "output": "/assets/"
    }
  ]
}
```

##### 4. Register the custom sprite in your app

```typescript
import {provideNdwUiKitCustomIcons} from '@ndw-ui-kit/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNdwUiKitCustomIcons({
      path: 'assets/my-custom.sprite.svg',
      // you can also load the list of icons directly from the JSON config file here
      // if you add `resolveJsonModule: true` to your app's tsconfig
      iconNames: ['wifi_signal_1_L', 'wifi_signal_2_L', 'usb_L'],
    }),
  ],
};
```

`provideNdwUiKitCustomIcons` always includes the core sprite automatically, so there is no
need to configure it separately. The `<ndwu-icon>` component will warn at runtime if an icon
name is used that was not included in the configured set.

#### Pictograms

Pictograms are a separate set of ~10 two-colored icons used inside certain `@ndw-ui-kit/core`
components. Those icons are merged into an additional SVG sprite file (`ndw-ui-kit.pictogram.sprite.svg`)
that should be included in your app's assets if you use any component that relies
on pictograms (e.g., `NdwuEmptyStateComponent` from `@ndw-ui-kit/core/widgets`).

### Router loader

`<ndwu-router-loader>` is an animated two-colored loader. The SVG is inlined, so it needs no sprite asset.

```html
<ndwu-router-loader />                            <!-- XL, 100×100 (default) -->
<ndwu-router-loader size="L" />                   <!-- L, 64×64 -->
<ndwu-router-loader firstColor="#66AC20" secondColor="#D4ECBD" />
<ndwu-router-loader [duration]="3000" />         <!-- one cycle in ms, 1500 by default -->
```

- By default, colors come from the `--ndwu-router-loader-first-color` / `--ndwu-router-loader-second-color`
  tokens and follow the active theme. `firstColor` / `secondColor` override them for a single instance.
- `duration` scales the whole animation cycle proportionally. Non-positive or non-numeric values fall back to 1500.
- The accessible name defaults to `Loading` and goes through the `localize` pipe. Use `ariaLabel` to change it.
- With `prefers-reduced-motion: reduce`, the animation is turned off.

### Tag

`<button ndwu-tag>` is an interactive tag. For a static label, use `<ndwu-badge>`.

```html
<button ndwu-tag selectable [(selected)]="isActive" label="Online"></button>
<button ndwu-tag removable label="Wi-Fi" (removed)="removeFilter('wifi')"></button>
```

- A removable tag announces `Remove` after its label. The text goes through the `localize` pipe; use `removeLabel` to change it.
  `ariaLabel` replaces the whole accessible name, so include the remove action in it yourself.
- `Delete` and `Backspace` on a focused removable tag emit `removed` and call `preventDefault()`.
  The event still bubbles, so document-level keyboard shortcuts must skip events with `defaultPrevented`.

### Localization

Choose one of the following translation providers:

- **Noop Translation (no localization &mdash; texts are shown as-is):**
  ```typescript
  import {provideNdwUiKitNoopTranslation} from '@ndw-ui-kit/core/l10n';

  providers: [provideNdwUiKitNoopTranslation()]
  ```

- **Ngx-Translate Integration (depends on `@ngx-translate/core`):**
  ```typescript
  import {provideNdwUiKitNgxTranslate} from '@ndw-ui-kit/core/l10n/ngx-translate';

  providers: [provideNdwUiKitNgxTranslate()]
  ```

  > Since this version the ngx-translate integration lives in a separate entry point
  > `@ndw-ui-kit/core/l10n/ngx-translate` (previously exported from `@ndw-ui-kit/core/l10n`),
  > so the package no longer requires `@ngx-translate/core` unless you import it.

#### HTML in text inputs

These inputs are translated with the `localizeHtml` pipe. A translated string is rendered
as trusted HTML, so inline styles such as `style="position: relative; top: 2px"` are kept:

- `ndwu-notification`: `message`.
- `ndwu-empty-state`: `header`, `description`.
- `ndwuTooltip`.

```html
<ndwu-notification message="setup.led-hint" />
```

A string without a translation is sanitized by Angular, so inline styles are removed from it.
To render other HTML as-is, pass a `SafeHtml` value; it is not translated.

### Component size

Components support size variants: `S`, `L`, `XL`, `XXL` (not all components
support every value). Specify size on individual components:

```html

<ndwu-button [size]="NDWU_SIZE.L">Submit</ndwu-button>
```

Use `ndwu-form-container` to set size for all child components at once:

```html

<ndwu-form-container [size]="NDWU_SIZE.XL">
  <ndwu-form-field>
    <ndwu-label>Email</ndwu-label>
    <input ndwuInput formControlName="email"/>
  </ndwu-form-field>
  <ndwu-button>Submit</ndwu-button>
</ndwu-form-container>
```

Size resolution priority:

1. Explicit `[size]` on the component itself
2. Inherited from the nearest parent container
3. Default (`NDWU_SIZE.XL`)

### Component tokens

You can customize component appearance by overriding CSS custom properties
emitted by the UI kit theme (`--ndwu-...`).

Use token overrides at the scope that matches your needs.

#### Global override (all instances)

```scss
:root {
  --ndwu-card-border-color: #8b5cf6;
  --ndwu-card-bg: #f8f5ff;
}
```

#### Theme-scoped override

```scss
.ndwu-theme-dark {
  --ndwu-card-border-color: #22d3ee;
  --ndwu-card-bg: #062b33;
}
```

#### Per-container override (single section/page)

To customize a specific component instance, create a custom class and apply it
to a wrapping container:

```html
<div class="custom-card-theme">
  <ndwu-card>
    Custom card content
  </ndwu-card>
</div>
```

```scss
.custom-card-theme {
  --ndwu-card-border-color: #7c3aed;
  --ndwu-card-bg: #f5f3ff;
  --ndwu-card-color: #1f2937;
}
```

Tip: inspect component styles (or playground examples) to find the exact token
names used by a specific component.

### Widgets

Composite components that are built on top of basic ones have a separate
entry point (`@ndw-ui-kit/core/widgets`), so apps that don't use them
don't pull them in together with basic components.

| Component              | Description                   |
|------------------------|-------------------------------|
| `ndwu-empty-state`     | Empty state with a pictogram  |
| `ndwu-file-upload`     | File dropzone with file list  |
| `ndwu-schedule-editor` | Weekly schedule editor canvas |

```typescript
import {NdwuEmptyStateComponent} from '@ndw-ui-kit/core/widgets';
```

Their form control wrappers (`ndwu-file-upload-field`, `ndwu-schedule-editor-field`)
stay in `@ndw-ui-kit/core/form-field`.

### Form field components (CVA)

The `ndw-ui-kit` provides a number o CVA components for common form controls (checkbox, input, select, etc.).
These implement Angular's
[`ControlValueAccessor`](https://angular.dev/api/forms/ControlValueAccessor)
and have a separate entry point (`@ndw-ui-kit/core/form-field`).

| Component                    | Description            |
|------------------------------|------------------------|
| `ndwu-checkbox-field`        | Checkbox (two-state)   |
| `ndwu-input-field`           | Text/password input    |
| `ndwu-multi-select-field`    | Multi-option select    |
| `ndwu-radio-field`           | Radio button list      |
| `ndwu-schedule-editor-field` | Weekly schedule editor |
| `ndwu-select-field`          | Single-option select   |
| `ndwu-textarea-field`        | Multi-line text input  |
| `ndwu-toggle-field`          | Toggle switch          |

#### Browser autofill

`ndwuInput` tracks browser autofill (`:autofill`) to keep the floating label raised
over an autofilled value.

Known limitation: Chrome/Edge autofill on page load only displays the value.
Until the first user interaction with the page, both `el.value` and the Angular control
value stay empty.
This can't be fixed on the library side.

#### Custom option lists

Select, multi-select, and radio components accept either `NdwuOption[]` directly
or domain arrays together with an `optionAdapter`:

```typescript
import {NdwuOptionAdapter} from '@ndw-ui-kit/core';

interface Country {
  code: string;
  name: string;
  isDisabled?: boolean;
}

const countries: Country[] = [
  {code: 'de', name: 'Germany'},
  {code: 'ch', name: 'Switzerland'},
];

const countryAdapter: NdwuOptionAdapter<Country> = {
  value: 'code',          // key selector: resolves Country.code
  label: 'name',          // key selector: resolves Country.name
  disabled: 'isDisabled', // optional
};
```

```html
<ndwu-select-field
  [options]="countries"
  [optionAdapter]="countryAdapter"
  formControlName="country"
/>
```

Selectors can also be functions when you need computed values:

```typescript
const countryAdapter: NdwuOptionAdapter<Country> = {
  value: (c) => c.code,
  label: (c) => `${c.name} (${c.code})`,
};
```

##### Project-wide default adapter

If your project mostly uses a single option shape across these components,
you can provide a default adapter via DI:

```typescript
import {NDWU_OPTION_CONFIG} from '@ndw-ui-kit/core';

providers: [
  {
    provide: NDWU_OPTION_CONFIG,
    useValue: {optionAdapter: countryAdapter}, // default adapter for all option-based components
  },
]
```

##### Multi-select custom trigger display

Use `ndwuMultiSelectDisplay` to render a custom trigger template for multiselect.
The template context provides both the original selected options (`selectedOptions`)
and the internal normalized option list (`normalizedOptions`):

```html
<ndwu-multi-select-field [options]="countries" [optionAdapter]="countryAdapter">
  <ng-template
    ndwuMultiSelectDisplay
    let-normalizedOptions="normalizedOptions"
    let-selectedOptions="selectedOptions"
    let-selectedValues="selectedValues"
    let-empty="empty"
  >
    @if (empty) {
      <span>No countries selected</span>
    } @else {
      <span>{{ selectedOptions.length }} selected</span>
    }
  </ng-template>
</ndwu-multi-select-field>
```

#### Validation

The NDW UI Kit shows validation errors for CVA components (currently
`ndwu-input-field`). Errors are only displayed after the control is `touched`.

##### `ndwuInput` without Angular forms

Without Angular forms the directive tracks interaction itself. Native
`:invalid` state shows only after `input` or `blur`; `form.reset()` clears it.
The result is written to `aria-invalid`.

To set the state explicitly, use `aria-invalid="true|false"` or
`[aria-invalid]="expr"`. It overrides computed state. Do not use
`[attr.aria-invalid]`: it writes the attribute directly and conflicts with
the directive. With Angular forms the control state is used and
`aria-invalid` input is ignored.

##### Built-in validators

Angular's `Validators` return errors without a message key, so the fields show
no text for them. Use `NdwuValidators` instead. They validate like Angular's
and add a translation key to each error:

```typescript
import {NdwuValidators, ndwuWrapValidator} from '@ndw-ui-kit/core/form-field';

name: new FormControl('', [
  NdwuValidators.required(),                                 // 'ndwu.validation.required'
  NdwuValidators.minLength(3),                               // 'ndwu.validation.min-length'
  NdwuValidators.maxLength(20, 'signup.name-too-long'),      // custom key
  ndwuWrapValidator(noSpacesValidator, 'signup.no-spaces'),  // any other validator
]),
```

Add the `ndwu.validation.*` keys to your translations. The error fields become
placeholders, e.g. `"Enter at least {{requiredLength}} characters"`. The keys
are exported as `NDWU_VALIDATION_ERROR_LABEL`. For the full key and placeholder
list and the design, see
[ADR 009](https://github.com/kndx-labs/ndw-ui-kit/blob/master/docs/architecture/ADR/009-ndwu-validators-wrapper.md).

Use the `ndwuRequired` input to show the required mark. Don't put Angular's
`required`, `email`, `minlength`, `maxlength` or `pattern` attributes on ndwu
fields: their validator directives replace the `NdwuValidators` errors.

`ndwuRequired` on `ndwu-checkbox-field` and `ndwu-radio-field` also sets
`required` on the native inputs. It only marks the field as required and
doesn't validate anything: add a validator to the control. If your prefer
builtin Angular validators, for a checkbox use `Validators.requiredTrue`,
because `Validators.required` treats `false` as a valid value.

##### How it works

A validator returns `ValidatorResult` (either `null` for success or `ErrorResult`):

```typescript
import {AbstractControl} from '@angular/forms';
import {ErrorResult, ValidatorResult} from '@ndw-ui-kit/core/form-field';

// Helper functions (define these in your app):
function ERROR(props: {key: string; value?: any}): ErrorResult {
  return {[props.key]: {errorLabel: props.key, ...props}};
}

function SUCCESS(): null {
  return null;
}

const requiredValidator = (control: AbstractControl): ValidatorResult => {
  const value = control.value;
  const isInvalid = value === undefined || value === '' || value === null;
  return isInvalid ? ERROR({key: 'This field is required', value}) : SUCCESS();
};
```

The built-in processor converts `ValidatorError` (an object with `errorLabel`) into
`NdwuValidationData`:

```typescript
export interface NdwuValidationData {
  errorMessage: string;
  validationData?: Record<string, any>;
}
```

#### Custom validation processor

For built-in Angular validators, prefer `NdwuValidators` (see above). Override the
built-in processor via the `NDWU_VALIDATION_PROCESSOR` token only if your
validators return errors in a different shape that you can't wrap:

```typescript
import {AbstractControl} from '@angular/forms';
import {NDWU_VALIDATION_PROCESSOR, NdwuValidationData} from '@ndw-ui-kit/core/form-field';

const customProcessor = (control: AbstractControl): NdwuValidationData | null => {
  const errors = control?.errors;
  if (!errors) return null;

  if (errors['required']) {
    return {errorMessage: 'validation.required'};
  }

  if (errors['minlength']) {
    return {
      errorMessage: 'validation.minlength',
      validationData: {
        requiredLength: errors['minlength'].requiredLength,
        actualLength: errors['minlength'].actualLength,
      },
    };
  }

  return null;
};

export const appConfig: ApplicationConfig = {
  providers: [
    {provide: NDWU_VALIDATION_PROCESSOR, useValue: customProcessor},
  ],
};
```

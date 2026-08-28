# 005 Structural modal header/footer slots

- Status: Accepted
- Date: 2026-06-11

## Context and Problem Statement

Before this change, `ndwuModalHeader` / `ndwuModalFooter` were effectively
styling helpers. When dialog or drawer content was opened through `NdwuModalService`,
component and template content was always attached into the container body portal.

That meant consumers could style an element to look like a header or footer
inside the body, but they could not replace the default modal parts:

- the default visual header still came from `title` / `description`
- the default footer still came from `config.buttons`
- custom actions inside scrollable content stayed inside the body instead
  of being rendered in the fixed outer footer area

We want to provide a way to define true custom header/footer regions for both
dialogs and drawers without introducing DOM-moving hacks.

## Considered Options

1. **Keep the current behavior and rely only on `title`, `description`, and `buttons`.**
   Rejected: this does not cover real custom header/footer
   layouts and keeps actions trapped inside the scrollable body.

2. **Move rendered DOM nodes from the body portal into the container header/footer.**
   Rejected: this is brittle in Angular, makes lifecycle/rendering behavior
   harder to reason about, and risks breaking template bindings/queries.

3. **Introduce a new slot API with new selectors/components.**
   Rejected: this would expand the public surface area and
   duplicate the existing modal semantics that consumers already know.

4. **Reuse `ndwuModalHeader` / `ndwuModalFooter` in dual mode: attribute usage for styling,
   structural usage for true slot registration.**
   Accepted: this preserves backward compatibility while adding an Angular-native
   way to render custom header/footer content in the actual container regions.

## Decision Outcome

The library now supports true modal header/footer replacement through structural directives:

- `*ndwuModalHeader`
- `*ndwuModalFooter`

The mechanism applies to content opened with:

- `open(...)`
- `openDialog(...)`
- `openDrawer(...)`
- `openTemplate(...)`

### Internal slot registry per modal instance

An internal `NdwuModalSlotRegistry` is created for every modal instance and provided through
`NDWU_MODAL_SLOT_REGISTRY` in the same injector as:

- `NDWU_MODAL_REF`
- `NDWU_MODAL_CONFIG`
- `NDWU_MODAL_DATA`

The registry stores one header template and one footer template as signals:

```ts
export type NdwuModalSlotName = 'header' | 'footer';

export class NdwuModalSlotRegistry {
  public readonly headerTemplate = signal<TemplateRef<unknown> | null>(null);
  public readonly footerTemplate = signal<TemplateRef<unknown> | null>(null);

  public register(slot, template) { /* stores the active template for the slot; */ }
  public unregister(slot, template) { /* clears the slot when the same template is destroyed; */ }
}
```

This keeps slot state isolated between simultaneously opened dialogs/drawers.

### Directive behavior

`NdwuModalHeaderDirective` and `NdwuModalFooterDirective` now support two modes.

#### 1. Attribute mode (existing behavior)

```html

<div ndwuModalFooter>
  ...
</div>
```

In this form, the directives behave as styling helpers only by attaching
the corresponding modal CSS class.

#### 2. Structural mode (new slot behavior)

```html

<section *ndwuModalHeader>
  ...
</section>

<footer *ndwuModalFooter>
  ...
</footer>
```

In structural mode, Angular supplies a `TemplateRef`. The directive:

- registers that template in the modal-scoped slot registry when the registry is available
- unregisters it on destroy
- does **not** render the content inline inside the body

### Container rendering rules

Both dialog and drawer containers now prefer custom slot templates over default chrome.

#### Header

If a custom header template is registered:

- it is rendered in the real container header area
- the default visual title/description block is suppressed
- the close button may still be rendered when enabled by config

If no custom header template exists:

- the container renders the default title/description header based on modal config

#### Footer

If a custom footer template is registered:

- it is rendered in the real container footer area
- the default footer generated from `config.buttons` is suppressed

If no custom footer template exists:

- the container renders the default buttons footer as before

### Accessibility behavior

The implementation preserves accessible naming for custom headers.

Resolution order is:

1. explicit `ariaLabel`
2. explicit `ariaLabelledby`
3. fallback `aria-label` derived from `title` when a custom header slot is used
4. default `aria-labelledby` pointing at the built-in title element when the default header is used

This keeps the feature usable without forcing immediate consumer migrations, while still making
explicit accessibility configuration possible.

### Scope of the change

The new mechanism intentionally covers only header and footer replacement.

`ndwuModalBody` remains a styling helper and does not participate in slot replacement.

## Consequences

### Pros

- Consumers can use custom header/footer for both dialogs and drawers.
- The same selectors work for both component content and `ng-template` content.
- Slot rendering is Angular-native (`TemplateRef`-based), so bindings,
  DI, and change detection remain intact.
- Slot state is scoped per modal instance through DI and does not leak across open modals.
- The close button remains available even when a custom header is used.

### Cons

- The feature depends on consumers understanding the difference
  between structural and attribute usage of the same selectors.
- Consumers still need to think about accessible naming when they fully replace
  the default title block.
- `ndwuModalBody` is still styling-only, so there is no full body-slot replacement mechanism.



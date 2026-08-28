# 007 Interaction registry

- Status: Accepted
- Date: 2026-07-13

## Context and Problem Statement

Certain `ndw-ui-kit` components, such as `NdwuSelectFieldComponent`,
handle keyboard events when focused or when their overlay is open.
Library consumers may also need to process keyboard events,
so they need a reliable way to know whether any `ndw-ui-kit` component
is currently handling keyboard interaction internally.

At the moment, that only can be done via DOM queries/traversal.
This approach is brittle. It couples consumers to internal implementation details
of `ndw-ui-kit` and CDK overlays.

`ndw-ui-kit` should provide some runtime tools to answer the following questions:

- is any tracked control currently focused?
- is any keyboard-owning overlay currently open?

For similar reasons, consumers may also need to know if any `ndw-ui-kit` modals
are opened at the moment.

## Considered Options

1. **Keep DOM sniffing outside the library.**
   Rejected: this preserves brittle coupling to internal markup, overlay implementation,
   and CSS classes. It also makes correct behavior harder for consumers to achieve.

2. **Expose counters (`focusedCount`, `overlayCount`) and increment/decrement them from components.**
   Rejected: counters are not idempotent. Their values may drift due to duplicate focus events,
   repeated open/close transitions, or destroy-time cleanup.

3. **Introduce a root interaction registry for focus and overlay state, and expose modal count via `NdwuModalService`.**
   Accepted: this provides a clean API and keeps state updates idempotent (see below)

## Decision Outcome

A new root service, `NdwuInteractionRegistry`, is introduced.

Its purpose is intentionally narrow:

- tracking focused controls of certain types
- tracking keyboard-owning overlays

The service API is:

```ts
type NdwuInteractionFocusType =
  | 'checkbox'
  | 'file-upload'
  | 'input'
  | 'radio'
  | 'select'
  | 'toggle';

interface NdwuInteractionRegistry {
  hasBlockingOverlay: Signal<boolean>;

  getFocusedStateSignal(
    types: NdwuInteractionFocusType | readonly NdwuInteractionFocusType[],
  ): Signal<boolean>;

  setFocused(type: NdwuInteractionFocusType, id: string, focused: boolean): void;
  setOverlayOpen(id: string, open: boolean): void;
}
```

Idempotency is ensured by reusing the unique `id` already provided for each
control/overlay surface, scoped by focus type.

### Meaning of `hasBlockingOverlay`

`hasBlockingOverlay` does **not** mean "any overlay with a backdrop" and does **not** mean "any focus trap".

It means:

- an overlay that currently owns keyboard interaction relevant to shortcut suppression

At present, that includes select-like surfaces whose keyboard handling is routed through
`NdwuComboboxInputDirective` and related listbox behavior.

### Integration points

Focus state is synchronized either from control-local `focused` signal state
or from composite-level `focusin` / `focusout` handlers.

Specifically:

- `NdwuInputDirective`
- `SelectFieldBase`
- `NdwuCheckboxComponent`
- `NdwuToggleComponent`
- `NdwuRadioGroupComponent` (via group-level `focusin` / `focusout`)
- `NdwuFileUploadComponent` (via composite-level `focusin` / `focusout`)

Overlay state is synchronized only at the select-field abstraction layer:

- `SelectFieldBase.onPanelOpened()` -> `setOverlayOpen(this.id, true)`
- `SelectFieldBase.onPanelClosed()` -> `setOverlayOpen(this.id, false)`

This applies regardless of whether the component is rendered in its mobile
or desktop presentation. Both the desktop dropdown and the mobile sheet
are considered keyboard-owning overlays for this purpose.

Registration is intentionally done in `SelectFieldBase`, rather than
in the popover/CDK layer, so the same logical surface is counted once.

### Modal count stays in `NdwuModalService`

`NdwuModalService` already owns modal open/close lifecycle through its
internal `openModals` array.

The service now exposes:

```ts
class NdwuModalService {
  public readonly openModalCount: signal<number>;
}
```

This keeps modal tracking local to the service that already creates, tracks, and disposes modal refs.

### Consumer usage

Consumers can explicitly combine both sources:

```ts
const shouldIgnoreShortcut = registry.getFocusedStateSignal(['input', 'select'])()
  || registry.hasBlockingOverlay()
  || modalService.openModalCount() > 0;
```

This keeps the contract small and honest:

- focus and overlay semantics live in`NdwuInteractionRegistry`
- modal count lives in `NdwuModalService`

## Consequences

### Pros

- Consumers stop depending on DOM queries, overlay DOM shape, and CSS classes.
- Keyboard-busy state becomes synchronous and semantic.
- Modal count stays with its existing lifecycle owner instead of being mirrored elsewhere.
- Internal refactors of DOM structure become safer because runtime state, not markup, becomes the contract.

### Cons

- Components must actively register/unregister focus and overlay state.
- Coverage is explicit: only integrated controls/surfaces contribute to the registry.
- Consumers have to check two different sources for keyboard-busy state
  (`NdwuInteractionRegistry` and `NdwuModalService`).


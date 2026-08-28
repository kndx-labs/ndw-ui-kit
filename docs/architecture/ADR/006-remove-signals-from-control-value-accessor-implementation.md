# 006 Remove signals from ControlValueAccessor implementation

- Status: Accepted
- Date: 2026-06-23

## Context and Problem Statement

`FormFieldBase<T>` stores the current field value as a `WritableSignal<T>` (`inputValue`).
`ControlValueAccessor` methods (`writeValue`, `setDisabledState`) mutate
this signal. If someone (indirectly) calls `writeValue` inside an `effect`
that leads to potentially conflicting updates, since the `inputValue` signal change
may re-trigger the same `effect` again. While having `inputValue` as a signal
is useful for computed signals that depend on it, it may lead to unexpected behavior
with complex forms.

This ADR is dedicated to eliminate all signal mutations inside `ControlValueAccessor` methods
while preserving existing component behavior.

## Considered Options

1. Keep as-is. The simplest option. Does not solve the conflicting-updates problem.

2. Introduce a `valueVersion` counter signal + `queueMicrotask` in `FormFieldBase`.
   Increment the version on every value change: `handleChange` bumps it immediately;
   `writeValue` schedules a bump via `queueMicrotask`. All downstream `computed`
   signals read `valueVersion()` for tracking.

   **Drawback**: `queueMicrotask` inside `writeValue` still triggers a cascade
   of `computed` re-evaluations on every `writeValue` call &mdash; just deferred in time.
   The cascade problem is not eliminated, only shifted.

3. Replace CVA-dependent downstream `computed` signals with TypeScript `get` accessors
   (`get empty(): boolean`). Accessors read both signals (for non-CVA properties:
   `focused`, `normalizedOptions`) and primitives (for CVA properties: `inputValue`, `isDisabled`).

   Angular tracks all signal reads that occur inside an accessor during template evaluation
   and schedules change detection when those signals change. For CVA-driven changes,
   change detection is triggered by the Angular Forms API itself after `writeValue`.

## Decision Outcome

Option 3 ("Replace downstream `computed` signals with `get` accessors") was chosen.

Specifically:
- The `NdwuControl` interface is changed: CVA-related properties
  (`empty`, `disabled`, `shouldLabelFloat`, `hasPlaceholder`, `id`) are no longer `Signal<T>`
  &mdash; they become plain `T`.
- `NdwuFormFieldComponent` also switches to `get` accessors for properties
  that read from `NdwuControl`.
- Signals NOT related to CVA (`focused`, `options`, `normalizedOptions`,
  `pendingSelection`, `combobox.expanded`) remain signals.

## Consequences

### Pros

- `ControlValueAccessor` methods mutate zero signals &mdash; neither directly nor indirectly.
- No `queueMicrotask` or other deferred hacks.
- Simpler mental model: CVA methods work with primitives,
  templates read accessors, Angular CD ties everything together.

### Cons

- The `NdwuControl` interface changes property signatures from `Signal<T>` to `T`
  &mdash; technically a breaking change, but the interface is only used internally within the library.
- `NdwuFormFieldComponent` is rewritten from `computed` signals to `get` accessors &mdash; more code, less magic.
- Accessors are not automatically memoized (unlike `computed`) &mdash; repeated evaluations
  may occur during frequent re-renders. In practice this is not an issue:
  the component tree is shallow and the computations inside accessors are cheap.

# 008 Nested modal switch animation (mobile)

- Status: Proposed
- Date: 2026-08-17

## Context and Problem Statement

`NdwuModalService` keeps open modals in an `openModals` stack signal. On
desktop, dialogs are centered boxes that visibly overlap, so nesting reads fine.
On mobile a dialog fills the screen (`100vw × 100dvh`), so the top one hides
everything below it.

We needed a new transition that shows a single modal instead of a stack. The
obstacle: `NdwuModalCloseStrategy` let a modal animate *itself* out (that's how
drawers slide away), but there was no hook for "a child opened above me, get out
of the way". A modal had no sanctioned way to affect a *different* modal.

## Considered Options

1. **Pure CSS with sibling / `:nth-child` selectors.** Rejected: CDK overlays
   aren't laid out predictably enough to select this way, and CSS gives no
   signal for *when* the animation finished — which we need before
   `overlayRef.dispose()`.

2. **Inline the logic in `NdwuModalService`, toggling the parent's classes
   directly.** Rejected in review: the service reached into another modal's
   `OverlayRef`, and it forced `OverlayRef` to become public on `NdwuModalRef`.

3. **Add `NdwuModalOpenStrategy`, symmetric to the existing close strategy.**
   Accepted: the service owns *policy* (who collapses, when), strategies own
   *mechanism* (which class, when disposal is safe).

## Decision Outcome

A new `NdwuModalOpenStrategy` mirrors the existing `NdwuModalCloseStrategy` —
the option closest to the existing design pattern for how modals work.

Note that most parts already existed on `master` — `openModals`,
`NdwuModalCloseStrategy`, `ImmediateCloseStrategy`, `DrawerCloseStrategy`. New
here: `NdwuModalOpenStrategy`, the two `Switch*` strategies, `stackingOnMobile`,
and `wait-for-animation-end.ts` (extracted from `DrawerCloseStrategy`).

### The new interface

```ts
export interface NdwuModalOpenStrategy {
  onOpen(overlayElement: HTMLElement): void;
  onBeforeChildOpen(overlayElement: HTMLElement): void;
  onAfterChildClose(overlayElement: HTMLElement): void;
}
```

`SwitchModalOpenStrategy` is the only implementation. All three methods delegate
to the same two helpers, so open and close code can't disagree about which class
means expanded vs collapsed:

| Method | Helper | Called when |
|---|---|---|
| `onOpen` | `expandMobileModal()` | it opens |
| `onBeforeChildOpen` | `collapseMobileModal()` | a child is about to open above it |
| `onAfterChildClose` | `expandMobileModal()` | its child has finished closing |

Expand and collapse are the only two states in this document; visually they are
a fade in and a fade out.

### The flow

`NdwuModalService.applySwitchAnimationOnOpen()` decides, on open:

- not a dialog, not mobile, or `stackingOnMobile: 'none'` → skip entirely
- otherwise → attach `SwitchModalOpenStrategy`, expand
- plus, if something sits below it and `stackingOnMobile !== 'stack'`, and that
  something is *also a dialog* → collapse it, and arrange for it to expand again

Every mobile dialog gets these strategies, not only nested ones: if only nested
dialogs expanded and collapsed, a standalone dialog would still vanish instantly
next to them, which looks broken.

In sequence:

```
OPEN
  Consumer → Service:  openDialog(Child)
  Service  → Child:    onOpen()             → child EXPANDS
  Service  → Parent:   onBeforeChildOpen()  → parent COLLAPSES

CLOSE
  Consumer → Child:    close()
  Child    → itself:   COLLAPSE, wait for animationend
  Child    → Service:  onFadedOut()         → service re-reads openModals
  Service  → Parent:   onAfterChildClose()  → parent EXPANDS again
  Child    → itself:   overlayRef.dispose()
```

### Waiting for the animation

`onAnimationEndOrFallback()` listens for `animationend` but also arms a timeout
at duration + 50ms — first one wins, so a close never hangs if the animation
doesn't run. Extracted from `DrawerCloseStrategy`, now shared by both.

`prefers-reduced-motion` shrinks the animation to `0.01ms` in SCSS rather than
removing it, so `animationend` still fires and the disposal path is unchanged.

### The parent is resolved at close time, not open time

The first version stored the parent's strategy and element inside the close
strategy when the child opened — stale by the time it closed. Now the close
strategy takes a plain `onFadedOut?: () => void` and knows nothing about
parents; the service looks up the current one when it fires. It filters by id
first, because the closing modal is still in `openModals` at that point —
removal happens on `afterClosed$`, after the collapse.

### Only dialogs are collapsed, never drawers

The `parentModal?.type === 'dialog'` guard matters: the expand/collapse classes
are dialog styling, and a drawer has its own slide animation. Without it, a
dialog opened from a drawer applied dialog classes to the drawer. (This was the
"cross drawer-dialog stacks" bug found mid-branch.)

### `stackingOnMobile`

Mobile-only, ignored on desktop:

| Value | Effect |
|---|---|
| `'replace'` | the dialog underneath collapses while the child is open, expands again after |
| `'stack'` | the child expands, the dialog underneath stays expanded |
| `'none'` | opt out — instant open/close, no strategies attached |

Default: `'replace'` when the option is unset.

`alert()` and `confirm()` set `'none'`: they're interruptions, not navigation
steps, so animating them adds latency without meaning.

### What changed on `master`

Five structural shifts came with the animation.

**1. Close behavior is no longer fixed at construction.** `closeStrategy` lost
its `readonly`. It's still picked by type in `createModalRef()`, but a mobile
dialog may then be *upgraded* to `SwitchModalCloseStrategy`. Strategy selection
went from a pure function of type, to type plus runtime context.

**2. `openModals` became load-bearing.** The signal existed, but nothing read it
except `openModalCount` — it was observability. Now `openModals.at(-2)` is how a
dialog finds what it covers, and the restore path re-reads it. A bookkeeping
list became the coordination point.

**3. Cross-modal effects got a channel — a narrow one.** Modals used to be fully
self-contained. Now the service invokes `onBeforeChildOpen()` /
`onAfterChildClose()` on one modal in response to another modal's lifecycle.

**4. `OverlayRef` got tighter, not looser.** Coordination needs the parent's DOM
element — Option 2 would have made `OverlayRef` public to get it. Instead:
`protected readonly` → `private readonly`, reachable only via an `@internal`
`getOverlayRef()`.

**5. The open flow grew a terminal step.** It now ends with
`applySwitchAnimationOnOpen()`, and the handset check moved out of
`createDialogOverlay()` — it used to decide sizing only, now the open flow needs
the same answer to decide whether to animate.

## Consequences

### Pros

- Nested full-screen dialogs transition instead of popping, so multi-step mobile
  flows read as navigation.
- Open and close are now symmetric interfaces, giving future modal behavior an
  obvious home instead of more branches inside `NdwuModalService`.
- The service never touches another modal's DOM directly, and `OverlayRef` stays
  off the public API.
- `DrawerCloseStrategy` lost ~40 lines by sharing the animation-end helper.

### Cons

- Parent/child is positional (the modal below the top) rather than an explicit
  reference — correct while modals close in stack order, fragile if that ever
  changes. Revisit if anything can close a modal out of stack order.
- Applies only to `type: 'dialog'` on mobile, so we maintain two similar
  animations and a drawer under a dialog simply doesn't react. Revisit if
  drawer-under-dialog stacks become a real flow rather than an edge case.
- `stackingOnMobile` is another flag whose effect is invisible on desktop — easy
  to set wrong and never notice.
- The new interface has exactly one implementation; it's justified by separation
  of concerns, not yet by reuse.

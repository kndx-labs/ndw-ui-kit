- Feature Name: ARIA layer
- Status: in-progress
- Start Date: 2026-03-26
- Authors: Dmitrii Sechin

# Summary

This document explains how the select, multi-select, and autocomplete field
components are built using ARIA layer primitives and how those primitives
interact with other parts ot the `ndw-ui-kit` at runtime.

The `ndw-ui-kit` implementation already contains a few specialized parts
encapsulating common patterns re-usable across different UI components:
1. The "popover" primitive: a trigger element which controls the visibility
   of a popover element. The popover element is rendered in an Angular CDK overlay.
2. The "form field" base class: a base implementation of the `ControlValueAccessor`
   interface, which provides common logic for form controls.

In this RFC, we propose to add a new "ARIA layer" that will be responsible for accessibility features.
The ARIA layer will contain directives that control behavior and attributes of certain DOM elements,
but do not provide any styling or structure. We will also add a few __styled components__
that can be reused in different select-like components.

# Technical design

Implementation of each of the select-like components can be divided into
three layers. Those layers are responsible for different aspects
of the overall behavior and appearance of the components.

```
┌───────────────────────────────────────────────────────────────┐
│  CVA `field` components (select, multi-select, autocomplete)  │  <- Interacting with Angular forms
├─────────────────────────────┬─────────────────────────────────┤
│  Form field container       │  Styled wrappers                │  <- Styling
│  (form-field, label, ctrl)  │  (styled-listbox, option)       │
├──────────────────────┬──────┴─────────────────────────────────┤
│  ARIA layer          │  Popover / overlay system              │  <- Skeleton
│  (combobox, listbox) │  (trigger, controller, host)           │
└──────────────────────┴────────────────────────────────────────┘
```

The ARIA layer and popover system are **deliberately decoupled** &mdash; they share no imports and
know nothing about each other. A bridge directive connects them at the template level.

## Component Map

### ARIA Layer

| Directive                            | Selector                      | Role                                                                                                       |
|--------------------------------------|-------------------------------|------------------------------------------------------------------------------------------------------------|
| `NdwuComboboxDirective`              | `[ndwuCombobox]`              | State container: holds `expanded` signal, tracks registered listbox; `canOpen` guard, `tabNavigation` flag |
| `NdwuComboboxInputDirective`         | `[ndwuComboboxInput]`         | ARIA combobox input: sets `role="combobox"`, handles keyboard/click, forwards keys to listbox              |
| `NdwuComboboxPopoverBridgeDirective` | `[ndwuComboboxPopoverBridge]` | Two-way bridge: syncs `combobox.expanded` <-> `popoverTrigger.isOpen`                                      |
| `NdwuListboxDirective`               | `[ndwuListbox]`               | ARIA listbox: manages selection, keyboard navigation (CDK `ActiveDescendantKeyManager`), active descendant |
| `NdwuOptionDirective`                | `[ndwuOption]`                | ARIA option: holds value/label, selected/active state, implements CDK `Highlightable`                      |


### Popover/Overlay System

| Class                         | Selector / Type        | Role                                                                                               |
|-------------------------------|------------------------|----------------------------------------------------------------------------------------------------|
| `NdwuPopoverTriggerDirective` | `[ndwuPopoverTrigger]` | Generic overlay trigger: manages open/close lifecycle, supports click/hover/focus triggers         |
| `NdwuPopoverController`       | Abstract class         | Base class for overlay controllers, creates `ComponentPortal` with child injector                  |
| `NdwuDropdownController`      | Concrete class         | Dropdown-specific controller: desktop (flexible position) and mobile (bottom sheet) layouts        |
| `NdwuPopoverHostComponent`    | `<ndwu-popover-host>`  | Rendered inside CDK overlay, renders dynamic content via `NgTemplateOutlet` or `NgComponentOutlet` |
| `createDropdownController`    | Factory function       | Creates `NdwuDropdownController` instances, passed as `[controllerFactory]` input                  |


### Form Field Container

| Class                          | Selector / Type                  | Role                                                                                  |
|--------------------------------|----------------------------------|---------------------------------------------------------------------------------------|
| `NdwuControl`                  | Interface + `NDWU_CONTROL` token | Contract: `id`, `focused`, `empty`, `disabled`, `shouldLabelFloat`, `hasRightIcon`    |
| `NdwuControlProviderDirective` | `[ndwuControlProvider]`          | Proxies a `NdwuControl` instance into the `NDWU_CONTROL` DI token                     |
| `NdwuFormFieldComponent`       | `<ndwu-form-field>`              | Discovers control via `contentChild(NDWU_CONTROL)`, manages label floating and layout |
| `NdwuFloatingLabelComponent`   | `<ndwu-floating-label>`          | Renders label text with optional required asterisk                                    |


### Styled Wrappers

| Component                    | Selector                | Role                                                                                           |
|------------------------------|-------------------------|------------------------------------------------------------------------------------------------|
| `NdwuStyledListboxComponent` | `<ndwu-styled-listbox>` | Wraps `NdwuListboxDirective` via `hostDirectives`, applies sizing and scroll styles            |
| `NdwuStyledOptionComponent`  | `<ndwu-styled-option>`  | Wraps `NdwuOptionDirective` via `hostDirectives`, applies selected/active/disabled CSS classes |
| `NdwuDropdownPanelComponent` | `<ndwu-dropdown-panel>` | Renders dropdown panel content (header/listbox/footer), applies certain overall panel styling  |


### Form Field Components

| Component                          | Selector                    | Extends                           | Value Type          |
|------------------------------------|-----------------------------|-----------------------------------|---------------------|
| `FormFieldBase<T>`                 | Abstract class              | Implements `ControlValueAccessor` | `<T>`               |
| `NdwuSelectFieldComponent`         | `<ndwu-select-field>`       | `FormFieldBase<string>`           | Single string ID    |
| `NdwuMultiSelectFieldComponent`    | `<ndwu-multi-select-field>` | `FormFieldBase<string[]>`         | Array of string IDs |
| `NdwuAutocompleteFieldComponent`   | `<ndwu-autocomplete-field>` | `FormFieldBase<string>`           | Typed text          |

> The autocomplete field is a thin wrapper around the core `<ndwu-autocomplete>` component,
> like `ndwu-textarea-field` around `ndwu-textarea`. The core component owns the input, the combobox
> and the panel. The value is the typed text; picking an option writes its label.

## How the Pieces Connect

All three field components share the same structural pattern. Here is the select field template
annotated with the role of each directive:

```html
<ndwu-form-field>                                    /* <- Layout wrapper, discovers NDWU_CONTROL */
  <ndwu-floating-label />                            /* <- Label (floats based on control state) */

  <div
    ndwuCombobox                                     /* <- ARIA state container (expanded, listbox ref) */
    ndwuComboboxInput                                /* <- ARIA input (role="combobox", keyboard handling) */
    ndwuComboboxPopoverBridge                        /* <- Bridge: combobox.expanded ↔ popoverTrigger.isOpen */
    [ndwuControlProvider]="this"                     /* <- Provides NDWU_CONTROL token for form-field */
    [ndwuPopoverTrigger]="panelTemplate"             /* <- Overlay trigger (content = panel template) */
    [controllerFactory]="dropdownControllerFactory"  /* <- How to create the overlay */
    [triggerOn]="'manual'"                           /* <- No auto-trigger; combobox drives open/close */
  >
    <span>{{ displayText() }}</span>
    <ndwu-icon [name]="chevronIcon()" />
  </div>

  <ng-template #panelTemplate>                       /* <- Rendered inside CDK overlay when open */
    <ndwu-dropdown-panel [sheet]="isMobileViewport()"> /* <- Styled panel container */
      
      /* Mobile-only panel header */
      @if (isMobileViewport()) {
      <div ndwuPanelHeader class="ndwu-select-field__panel-header">
        <span class="ndwu-select-field__panel-label">{{ label() }}</span>
        <button
          ndwuIconButton
          variant="flat"
          [icon]="ICON_NAME.CLOSE_L"
          class="ndwu-select-field__panel-close"
          (click)="closePanel()"
        >
        </button>
      </div>
      }
      <ndwu-styled-listbox                           /* <- Styled listbox (hosts NdwuListboxDirective) */
        [size]="dropdownSize()"
        [comboboxRef]="combobox()"                   /* <- Explicit combobox ref (crosses portal boundary) */
        [values]="inputValue() ? [inputValue()] : []"
        selectionMode="explicit"
        (valuesChange)="onSelectionChange($event)"
      >
        @for (opt of options(); track opt.id) {
        <ndwu-styled-option [value]="opt.id" [label]="opt.label"> /* <- Styled option */
          {{ opt.label }}
        </ndwu-styled-option>
        }
      </ndwu-styled-listbox>
    </ndwu-dropdown-panel>
  </ng-template>
</ndwu-form-field>
```

## Runtime Flows

### Opening the Dropdown

```
User clicks trigger
  │
  V
NdwuComboboxInputDirective.onClick()
  │  (injects NdwuComboboxDirective)
  V
NdwuComboboxDirective.open()
  │  sets expanded.set(true)
  │
  V
NdwuComboboxPopoverBridgeDirective  <- effect watches combobox.expanded()
  │  sees expanded=true, popover closed
  │  calls popoverTrigger.toggle()
  │
  V
NdwuPopoverTriggerDirective.toggle()
  │  resolves content from [ndwuPopoverTrigger] input
  │  calls this.open({content, providers, ...})
  │
  V
NdwuDropdownController.open()
  │  creates CDK OverlayRef (desktop: flexible position, mobile: bottom sheet)
  │  calls attachPortal() -> creates ComponentPortal(NdwuPopoverHostComponent)
  │  attaches to overlay
  │
  V
NdwuPopoverHostComponent renders
  │  receives content (TemplateRef) via NDWU_POPOVER_CONTENT token
  │  renders via NgTemplateOutlet -> stamps out #panelTemplate
  │
  V
NdwuStyledListboxComponent instantiates
  │  NdwuListboxDirective (hostDirective) constructor runs
  │  comboboxRef input receives NdwuComboboxDirective instance
  │  effect -> calls combobox.registerListbox(this)
  │  expand effect -> calls gotoFirstSelectedOrFirst() -> scrolls to selected option
```

### Keyboard Navigation

```
User presses ArrowDown while trigger is focused
  │
  V
NdwuComboboxInputDirective.onKeydown()
  │  if dropdown open: forwards to combobox.listbox().handleKeydown(event)
  │  if dropdown closed: opens dropdown first
  │
  V
NdwuListboxDirective.handleKeydown()
  │  delegates to CDK ActiveDescendantKeyManager.onKeydown()
  │  CDK updates activeItem
  │  calls syncActiveState() -> updates option.active signals + activeDescendantId
  │  calls scrollActiveItemIntoView()
  │
  V
NdwuComboboxInputDirective host binding
  │  [aria-activedescendant] reads combobox.activeDescendantId()
  │  which reads listbox.activeDescendantId()
  │  -> screen reader announces the active option
```

### Selecting an Option

```
User clicks an option (or presses Enter/Space)
  │
  V
NdwuListboxDirective.onClick() / selectActiveItem()
  │  calls selectValue(value) -> updates values signal
  │  values model emits (valuesChange)
  │
  V
Field component onSelectionChange(values)
  │  calls handleChange(value) -> updates inputValue, calls onChange (ControlValueAccessor)
  │  calls combobox().close({focusOrigin: false})
  │
  V
NdwuComboboxDirective.close()
  │  sets expanded.set(false), stores lastCloseOptions
  │
  V
NdwuComboboxPopoverBridgeDirective  <- effect detects expanded=false
  │  calls popoverTrigger.close(lastCloseOptions)
  │
  V
NdwuDropdownController.close()
  │  detaches overlay, restores focus to trigger (unless focusOrigin=false)
```

### Closing the Dropdown

There are multiple close paths:

| Trigger                                  | Flow                                                                                                                                                 |
|------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Escape key**                           | `NdwuComboboxInputDirective.onKeydown()` -> `combobox.close()` -> bridge -> popover                                                                  |
| **Tab key**                              | `NdwuComboboxInputDirective.onKeydown()` -> `combobox.close()` -> bridge -> popover                                                                  |
| **Backdrop click**                       | `NdwuDropdownController` backdrop handler -> `onOverlayDetached()` -> `popoverTrigger.isOpen.set(false)` -> bridge -> `combobox.expanded.set(false)` |
| **Option click (select/autocomplete)**   | Selection handler -> `combobox.close()` -> bridge -> popover                                                                                         |
| **Confirm button (multi-select mobile)** | `onConfirm()` -> `combobox.close()` -> bridge -> popover                                                                                             |

With `tabNavigation` on (autocomplete), Tab and Shift+Tab move the active option while the panel
is open and has an enabled option. Otherwise Tab closes the panel as above.

---

### Multi-Select: Pending Selection

Multi-select has an extra state layer for mobile UX. On mobile, selections are not committed
until the user taps "Confirm":

```
pendingSelection signal <- initialized from inputValue() when dropdown opens
       │
       V
[values]="pendingSelection()"  <- listbox shows checkmarks based on pending
       │
  onSelectionChange(values)    <- updates pendingSelection on each toggle
       │
       ├─ Desktop: immediately calls handleChange(values)
       │
       └─ Mobile: waits for onConfirm() -> handleChange(pendingSelection())
                  or onCancel() -> close without committing
```

## Drawbacks

### Cross-Portal Communication

The `<ng-template #panelTemplate>` is defined in the field component's template but rendered
inside the CDK overlay (a different DOM subtree). This creates a **DI boundary**: element-level
directives on the trigger (like `NdwuComboboxDirective`) are not injectable inside the portal.

#### The Problem

```
Field Component Template
├── <div ndwuCombobox ...>            <- NdwuComboboxDirective lives here
│
├── <ng-template #panelTemplate>      <- defined here, but rendered in overlay
│     └── <ndwu-styled-listbox>
│           └── NdwuListboxDirective  <- needs NdwuComboboxDirective, but can't inject it
│
CDK Overlay Container (different DOM tree)
└── <ndwu-popover-host>
      └── [NgTemplateOutlet renders #panelTemplate here]
            └── <ndwu-styled-listbox>  <- inject(NdwuComboboxDirective) returns null
```

`NgTemplateOutlet` preserves the **defining view's injector** (the field component), not the
portal host's. But element-level directives are part of the **element injector tree**, not the
component's provider chain. So the listbox inside the template cannot reach
`NdwuComboboxDirective` via DI.

#### The Solution: Explicit Input

Following the same pattern as Angular Material's `[matAutocomplete]="auto"`, the combobox
reference is passed as an explicit input:

```html
<ndwu-styled-listbox [comboboxRef]="combobox()">
```

Where `combobox()` is a `viewChild(NdwuComboboxDirective)` in the field component. The
`NdwuListboxDirective` merges this input with the DI injection:

```typescript
// DI injection (works when listbox is in the same view as combobox)
private readonly injectedCombobox = inject(NdwuComboboxDirective, {optional: true});

// Input (works across portal boundaries)
public readonly comboboxRef = input<NdwuComboboxDirective | undefined>(undefined);

// Resolved: input takes precedence over DI
protected readonly combobox = computed(() => this.comboboxRef() ?? this.injectedCombobox ?? null);
```

This dual approach means the listbox works both standalone (same-view DI) and inside a portal (explicit input).


# Unresolved questions

- Is the proposed set of ARIA primitives too fine-grained? Are there any missing pieces?
- How do we ensure that components implemented with ARIA layer primitives are/will stay accessible?
- What parts of the three implemented select-like components should be customizable via inputs/custom content child templates?

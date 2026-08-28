import {
  DestroyRef,
  Directive,
  Injector,
  OnInit,
  type Signal,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {BreakpointObserver} from '@angular/cdk/layout';
import {
  ICON_NAME,
  type NdwuControl,
  NdwuFormFieldComponent,
  type NdwuInteractionFocusType,
  NdwuInteractionRegistry,
  NdwuSizeDirective,
} from '@ndw-ui-kit/core';
import {NdwuComboboxDirective} from '@ndw-ui-kit/core/aria';
import {createDropdownController} from '@ndw-ui-kit/core/popover';
import {HANDSET_BREAKPOINT, uniqueId} from '@ndw-ui-kit/core/utils';
import {setValueAccessor, syncIsInvalid} from '../form-field.utils';
import {FormFieldBase} from './form-field-base';

const SELECT_FOCUS_TYPE: NdwuInteractionFocusType = 'select';

/**
 * Base class for select-like fields. Encapsulates behavior common to all fields of that kind,
 * such as panel expansion tracking and mobile viewport handling.
 *
 * This class provides:
 * - NdwuControl contract properties.
 * - Mobile-viewport detection, panel class, panel expansion tracking.
 * - Reactive `invalid` state tracking, and `setDisabledState` override.
 *
 * Subclasses must declare their own @input() bindings and HTML template.
 * Subclasses must contain `<ndwu-form-field>`.
 * Subclasses must add the `NdwuComboboxDirective` to their dropdown trigger element.
 * Subclasses must add the `NdwuResizeObserverDirective` directive to one of
 * their view children for width tracking.
 */
@Directive() // to be able to use the Angular DI mechanism
export abstract class SelectFieldBase<T> extends FormFieldBase<T> implements NdwuControl, OnInit {
  protected readonly injector = inject(Injector);
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly breakpoint = inject(BreakpointObserver);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly dropdownControllerFactory = createDropdownController;
  protected readonly registry = inject(NdwuInteractionRegistry);

  protected readonly combobox = viewChild(NdwuComboboxDirective);
  protected readonly formField = viewChild(NdwuFormFieldComponent);

  // == NdwuControl ===========================================================
  protected readonly idValue: string;

  public readonly focused = signal<boolean>(false);
  public readonly invalid = signal<boolean>(false);

  // Subclasses provide their own "is field empty" logic (it will be different for, e.g., select vs. multiselect).
  public abstract get empty(): boolean;

  // Subclasses expose placeholder input; base derives hasPlaceholder.
  public abstract readonly placeholder: Signal<string>;

  public get id(): string {
    return this.idValue;
  }

  public get disabled(): boolean {
    return this.isDisabled;
  }

  public get hasPlaceholder(): boolean {
    return !!this.placeholder();
  }

  public get shouldLabelFloat(): boolean {
    return (
      this.focused()
      || !this.empty
      || this.hasPlaceholder
      || (this.combobox()?.expanded() ?? false)
    );
  }

  // == Shared computed signals ===============================================
  protected readonly chevronIcon = computed(() => {
    return (this.combobox()?.expanded() ?? false)
      ? ICON_NAME.CHEVRON_UP_S
      : ICON_NAME.CHEVRON_DOWN_S;
  });

  protected readonly panelClass = computed(() => {
    const base = ['ndwu-options-panel'];

    return this.isMobileViewport() ? [...base, 'ndwu-options-panel--sheet'] : base;
  });

  // == Constructor, lifecycle hooks ==========================================
  constructor(
    defaultValue: T,
    protected ngControl: NgControl,
    idPrefix: string,
  ) {
    super(defaultValue);

    this.idValue = uniqueId(idPrefix);

    setValueAccessor(ngControl, this);
    this.initFocusTracking();
    this.initExpansionTracking();

    this.destroyRef.onDestroy(() => {
      this.registry.setFocused(SELECT_FOCUS_TYPE, this.id, false);
      this.registry.setOverlayOpen(this.id, false);
    });
  }

  public ngOnInit(): void {
    const control = this.ngControl?.control;

    if (!control) {
      return;
    }

    syncIsInvalid(control, this.invalid, this.destroyRef);
  }

  // == FormBase overrides ====================================================
  public override setDisabledState(isDisabled: boolean): void {
    super.setDisabledState(isDisabled);
  }

  // == Shared methods ========================================================
  protected closePanel(): void {
    this.combobox()?.close();
  }

  protected isMobileViewport(): boolean {
    return this.breakpoint.isMatched(HANDSET_BREAKPOINT);
  }

  protected initFocusTracking(): void {
    effect(
      () => this.registry.setFocused(SELECT_FOCUS_TYPE, this.id, this.focused()),
      {injector: this.injector},
    );
  }

  /**
   * Tracks combobox expansion. Called once from the constructor.
   *
   * Delegates to `onPanelOpened()` / `onPanelClosed()` so subclasses can
   * hook into transitions without creating a second effect watching the
   * same signal.
   */
  protected initExpansionTracking(): void {
    let wasExpanded = false;

    effect(
      () => {
        const expanded = this.combobox()?.expanded() ?? false;

        if (!wasExpanded && expanded) {
          this.onPanelOpened();
        }

        if (wasExpanded && !expanded) {
          this.onPanelClosed();
        }

        wasExpanded = expanded;
      },
      {injector: this.injector},
    );
  }

  // Called when the dropdown opens. Override in subclasses for extra logic.
  protected onPanelOpened(): void {
    this.registry.setOverlayOpen(this.id, true);
  }

  // Called when the dropdown closes. Marks the control as touched.
  protected onPanelClosed(): void {
    this.registry.setOverlayOpen(this.id, false);
    this.onTouched();
  }
}

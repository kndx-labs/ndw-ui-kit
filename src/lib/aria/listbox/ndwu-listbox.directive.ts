import {
  Directive,
  Injector,
  Signal,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import {ActiveDescendantKeyManager, Highlightable} from '@angular/cdk/a11y';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuComboboxDirective} from '../combobox/ndwu-combobox.directive';
import {NdwuOptionDirective} from './ndwu-option.directive';

/**
 * ARIA listbox — manages selection, keyboard navigation, and active-descendant tracking.
 * Attach to the scrollable container element (`<ul>`, `<div>`, etc.) that holds [ndwuOption] items.
 * Can be used standalone or inside a combobox (linked via DI or the [comboboxRef] input).
 */
@Directive({
  selector: '[ndwuListbox]',
  host: {
    'role': 'listbox',
    '[id]': 'id()',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-multiselectable]': 'multi() ? "true" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.aria-activedescendant]': 'activeDescendantId()',
    '[tabindex]': '(disabled() || !!this.combobox()) ? -1 : 0',
    '(mousedown)': 'onMousedown($event)',
    '(focus)': 'onFocus()',
    '(keydown)': 'onKeydown($event)',
    '(click)': 'onClick($event)',
  },
  exportAs: 'ndwuListbox',
})
export class NdwuListboxDirective<V = unknown> {
  private readonly injector = inject(Injector);
  private readonly injectedCombobox = inject(NdwuComboboxDirective, {optional: true});

  /** Explicit combobox reference for cross-portal usage where DI cannot reach. */
  public readonly comboboxRef = input<NdwuComboboxDirective | undefined>(undefined);

  /** Resolved combobox: input takes precedence over DI. */
  protected readonly combobox = computed<NdwuComboboxDirective | null>(() => {
    return this.comboboxRef() ?? this.injectedCombobox ?? null;
  });

  public readonly multi = input<boolean>(false);
  public readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  public readonly wrap = input<boolean>(true);
  public readonly selectionMode = input<'follow' | 'explicit'>('follow');
  public readonly disabled = input<boolean>(false);
  public readonly readonly = input<boolean>(false);
  public readonly typeaheadDelay = input<number>(200);

  /** Two-way bindable selected values. */
  public readonly values = model<V[]>([]);

  /** All child option directives. */
  public readonly options = contentChildren(NdwuOptionDirective);

  /** Id of the currently active option (for aria-activedescendant). */
  public readonly activeDescendantId = signal<string | null>(null);

  public readonly id = signal<string>(uniqueId('ndwu-listbox-'));

  private keyManager: ActiveDescendantKeyManager<Highlightable> | null = null;

  constructor() {
    // Register/unregister with combobox reactively (handles both DI and input).
    effect((onCleanup) => {
      const comboboxInstance = this.combobox();

      if (comboboxInstance) {
        comboboxInstance.registerListbox(this as NdwuListboxDirective);

        onCleanup(() => {
          comboboxInstance.unregisterListbox(this as NdwuListboxDirective);
        });
      }
    });

    // Defer selection sync until after the first render so that content children
    // have their required inputs (value, label) bound via template bindings.
    afterNextRender(
      () => {
        this.syncSelectedState();
        this.scrollFirstSelectedIntoView();

        effect(
          () => {
            this.syncSelectedState();
          },
          {injector: this.injector},
        );

        // Combobox expand -> scroll to certain option and focus on it
        // (only when WAI-ARIA specifies focus should move).
        effect(
          () => {
            const comboboxInstance = this.combobox();

            if (!comboboxInstance) {
              return;
            }

            const expanded = comboboxInstance.expanded();
            const openCause = comboboxInstance.openCause();
            const opts = this.options();

            // WAI-ARIA specifies that focus should move when opened with:
            // - 'arrow-down' (Down Arrow) -> selected option, or first option
            // - 'arrow-up' (Up Arrow) -> selected option, or first option
            // - 'home' (Home) -> first option
            // - 'end' (End) -> last option
            // - 'type' (printable characters) -> first matching option
            const shouldActivate = expanded
              && openCause
              && ['arrow-down', 'arrow-up', 'home', 'end', 'type'].includes(openCause);

            if (shouldActivate && opts.length > 0) {
              const cause = openCause;

              afterNextRender(
                () => {
                  const typeaheadEvent = cause === 'type' ? comboboxInstance.consumePendingTypeaheadEvent() : null;

                  this.gotoFocusedOption(cause, typeaheadEvent);
                },
                {injector: this.injector},
              );
            }
          },
          {injector: this.injector},
        );
      },
    );
  }

  public scrollActiveItemIntoView(scrollOptions?: ScrollIntoViewOptions): void {
    const active = this.getActiveOption();

    if (active) {
      active.elementRef.nativeElement.scrollIntoView(scrollOptions ?? {block: 'nearest'});
    }
  }

  public gotoFirst(): void {
    this.ensureKeyManager();
    this.keyManager?.setFirstItemActive();
    this.syncActiveState();
  }

  /** Activates and scrolls to the first selected option, or falls back to first option. */
  private gotoFocusedOption(cause?: string, typeaheadEvent?: KeyboardEvent | null): void {
    this.ensureKeyManager();

    if (this.keyManager?.activeItem) {
      return;
    }

    if (typeaheadEvent) {
      this.keyManager?.onKeydown(typeaheadEvent);
    } else if (cause === 'end') {
      this.keyManager?.setLastItemActive();
    } else {
      const opts = this.options();
      const currentValues = this.values();
      const firstSelectedIndex = opts.findIndex((opt) => {
        return !opt.disabled() && currentValues.includes(opt.value() as V);
      });

      if (firstSelectedIndex >= 0) {
        this.keyManager?.setActiveItem(firstSelectedIndex);
      } else {
        this.keyManager?.setFirstItemActive();
      }
    }

    this.syncActiveState();
    this.scrollActiveItemIntoView();
  }

  /** Scrolls the first selected option into view (used on initial render). */
  private scrollFirstSelectedIntoView(): void {
    const currentValues = this.values();
    const opts = this.options();

    if (currentValues.length === 0 || opts.length === 0) {
      return;
    }

    const firstSelected = opts.find((opt) => {
      return currentValues.includes(opt.value() as V);
    });

    if (firstSelected) {
      firstSelected.elementRef.nativeElement.scrollIntoView({block: 'nearest'});
    }
  }

  private syncSelectedState(): void {
    const currentValues = this.values();
    const opts = this.options();

    for (let i = 0; i < opts.length; i++) {
      const opt = opts[i];

      if (!opt) {
        continue;
      }

      const isSelected = currentValues.includes(opt.value() as V);

      opt.selected.set(isSelected);

      if (isSelected) {
        const prevSelected = i > 0
          && opts?.[i - 1]
          && currentValues.includes(opts?.[i - 1]?.value() as V);

        const nextSelected = i < opts.length - 1
          && opts?.[i + 1]
          && currentValues.includes(opts?.[i + 1]?.value() as V);

        opt.firstInSelectedGroup.set(!prevSelected);
        opt.lastInSelectedGroup.set(!nextSelected);
      } else {
        opt.firstInSelectedGroup.set(false);
        opt.lastInSelectedGroup.set(false);
      }
    }
  }

  private getActiveOption(): NdwuOptionDirective<V> | null {
    return (this.keyManager?.activeItem ?? null) as NdwuOptionDirective<V> | null;
  }

  /**
   * Lazily initializes the CDK key manager on first user interaction.
   * Cannot be created inside an effect() because ActiveDescendantKeyManager's
   * constructor internally calls effect(), which is forbidden in a reactive context.
   */
  private ensureKeyManager(): void {
    if (this.keyManager || this.options().length === 0) {
      return;
    }

    this.initKeyManager();
  }

  private initKeyManager(): void {
    // CDK's Highlightable expects `disabled?: boolean`,
    // but Angular signal inputs produce `InputSignal<boolean>`.
    //
    // We bridge with skipPredicate for correct disabled handling.
    const manager = new ActiveDescendantKeyManager<Highlightable>(
      this.options as unknown as Signal<readonly Highlightable[]>,
      this.injector,
    ).skipPredicate((item) => (item as unknown as NdwuOptionDirective).disabled());

    if (this.orientation() === 'horizontal') {
      manager.withHorizontalOrientation('ltr');
    } else {
      manager.withVerticalOrientation();
    }

    if (this.wrap()) {
      manager.withWrap();
    }

    if (this.typeaheadDelay() > 0) {
      manager.withTypeAhead(this.typeaheadDelay());

      manager.change.subscribe(() => {
        this.syncActiveState();
        this.scrollActiveItemIntoView();
      });
    }

    this.keyManager = manager;
  }

  /** Prevent focus transfer to the listbox when managed by a combobox. */
  protected onMousedown(event: MouseEvent): void {
    if (this.combobox()) {
      event.preventDefault();
    }
  }

  /**
   * WAI-ARIA: when a multi-select listbox receives focus, activate the first
   * selected option; for single-select, activate the selected option.
   * If nothing is selected, activate the first non-disabled option.
   */
  protected onFocus(): void {
    if (this.disabled()) {
      return;
    }

    this.gotoFocusedOption();
  }

  public handleKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    this.ensureKeyManager();

    const key = event.key;
    const isNavKey = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key);
    const isSelectKey = key === 'Enter' || key === ' ';

    if (isSelectKey && this.selectionMode() === 'explicit') {
      event.preventDefault();
      this.selectActiveItem();

      return;
    }

    if (isSelectKey && this.selectionMode() === 'follow') {
      event.preventDefault();

      if (this.multi()) {
        this.selectActiveItem();
      }

      return;
    }

    if (isNavKey) {
      event.preventDefault();
    }

    this.keyManager?.onKeydown(event);
    this.syncActiveState();

    if (isNavKey) {
      this.scrollActiveItemIntoView();

      if (this.selectionMode() === 'follow' && !this.multi()) {
        this.selectActiveItem();
      }
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.handleKeydown(event);
  }

  protected onClick(event: MouseEvent): void {
    if (this.disabled() || this.readonly()) {
      return;
    }

    this.ensureKeyManager();

    const target = event.target as HTMLElement;
    const opts = this.options();

    for (const opt of opts) {
      if (opt.elementRef.nativeElement.contains(target) && !opt.disabled()) {
        this.selectValue(opt.value() as V);
        break;
      }
    }
  }

  private selectValue(value: V): void {
    if (this.multi()) {
      const current = this.values();

      if (current.includes(value)) {
        this.values.set(current.filter((v) => v !== value));
      } else {
        this.values.set([...current, value]);
      }
    } else {
      this.values.set([value]);
    }
  }

  private selectActiveItem(): void {
    if (this.readonly()) {
      return;
    }

    const active = this.getActiveOption();

    if (!active || active.disabled()) {
      return;
    }

    this.selectValue(active.value());
  }

  private syncActiveState(): void {
    const active = this.getActiveOption();
    const opts = this.options();

    for (const opt of opts) {
      opt.active.set(opt === active);
    }

    this.activeDescendantId.set(active?.id() ?? null);
  }
}

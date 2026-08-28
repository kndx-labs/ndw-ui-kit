import {Directive, ElementRef, inject, input, signal} from '@angular/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';

/**
 * ARIA option — represents a single selectable item inside a [ndwuListbox].
 * Attach to each list-item element (`<li>`, `<div>`, etc.) that the user can select.
 */
@Directive({
  selector: '[ndwuOption]',
  host: {
    'role': 'option',
    '[id]': 'id()',
    '[attr.aria-selected]': 'selected() ? "true" : "false"',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-active]': 'active() ? "true" : null',
  },
  exportAs: 'ndwuOption',
})
export class NdwuOptionDirective<V = unknown> {
  public readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  public readonly value = input.required<V>();
  public readonly label = input<string>('');
  public readonly disabled = input<boolean>(false);

  public readonly id = signal<string>(uniqueId('ndwu-option-'));

  /**
   * Managed by the parent NdwuListboxDirective.
   * True when this option is in the listbox's selected values.
   */
  public readonly selected = signal<boolean>(false);

  /**
   * Managed by the parent NdwuListboxDirective.
   * True when this option starts a consecutive selected group.
   */
  public readonly firstInSelectedGroup = signal<boolean>(false);

  /**
   * Managed by the parent NdwuListboxDirective.
   * True when this option ends a consecutive selected group.
   */
  public readonly lastInSelectedGroup = signal<boolean>(false);

  /**
   * Managed by the parent NdwuListboxDirective.
   * True when this option is the active (focused) item.
   */
  public readonly active = signal<boolean>(false);

  /** Called by CDK ActiveDescendantKeyManager when this item becomes active. */
  public setActiveStyles(): void {
    this.active.set(true);
  }

  /** Called by CDK ActiveDescendantKeyManager when this item becomes inactive. */
  public setInactiveStyles(): void {
    this.active.set(false);
  }

  /** Label used for typeahead search. Falls back to textContent. */
  public getLabel(): string {
    return this.label() || this.elementRef.nativeElement.textContent?.trim() || '';
  }
}

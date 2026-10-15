import {Directive, computed, input, signal} from '@angular/core';
import type {NdwuListboxDirective} from '../listbox/ndwu-listbox.directive';

/**
 * Root state holder for the ARIA combobox pattern.
 * Tracks expanded/collapsed state, registered listbox, and active descendant.
 * Attach to the wrapper element that contains both the input and the popup.
 *
 * **Close-on-select:** This directive does not automatically close the popup
 * when the user selects an option. Consuming components (e.g., `select-field`)
 * are responsible for calling `close()` after a value change when the
 * desired UX is single-select-then-close.
 */
@Directive({
  selector: '[ndwuCombobox]',
  exportAs: 'ndwuCombobox',
})
export class NdwuComboboxDirective {
  public readonly readonly = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly canOpen = input<boolean>(true);
  public readonly tabNavigation = input<boolean>(false);
  public readonly expanded = signal<boolean>(false);

  /**
   * What triggered the most recent open (arrow-up/down, enter, space, alt + arrow-up/down, home, end, type, mouse).
   *
   * @see https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction
   */
  public readonly openCause = signal<string | null>(null);

  /** Options from the most recent close() call, read by the bridge to pass to the popover. */
  public readonly lastCloseOptions = signal<{focusOrigin?: boolean} | undefined>(undefined);

  /** Registered listbox (set via registerListbox / unregisterListbox). */
  public readonly listbox = signal<NdwuListboxDirective | null>(null);

  private readonly pendingTypeaheadEvent = signal<KeyboardEvent | null>(null);

  /** Id of the registered listbox element (for aria-controls). */
  public readonly listboxId = computed(() => this.listbox()?.id() ?? null);

  /** Id of the active option in the registered listbox (for aria-activedescendant). */
  public readonly activeDescendantId = computed(() => this.listbox()?.activeDescendantId() ?? null);

  public registerListbox(listbox: NdwuListboxDirective): void {
    this.listbox.set(listbox);
  }

  public unregisterListbox(listbox: NdwuListboxDirective): void {
    if (this.listbox() === listbox) {
      this.listbox.set(null);
    }
  }

  public open(cause?: string, event?: KeyboardEvent): void {
    if (this.disabled() || this.expanded() || !this.canOpen()) {
      return;
    }

    this.openCause.set(cause ?? null);
    this.pendingTypeaheadEvent.set(event ?? null);
    this.expanded.set(true);
  }

  public consumePendingTypeaheadEvent(): KeyboardEvent | null {
    const event = this.pendingTypeaheadEvent();

    this.pendingTypeaheadEvent.set(null);

    return event;
  }

  public close(options?: {focusOrigin?: boolean}): void {
    if (!this.expanded()) {
      return;
    }

    this.lastCloseOptions.set(options);
    this.openCause.set(null);
    this.expanded.set(false);
  }
}

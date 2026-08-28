import {Directive, inject, model} from '@angular/core';
import {NdwuComboboxDirective} from './ndwu-combobox.directive';

/**
 * ARIA combobox input — sets `role="combobox"` and manages keyboard interaction.
 * Attach to the `<input>` or focusable element that the user types into / activates.
 * Must be a descendant of an element with [ndwuCombobox] or that element itself.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/combobox
 */
@Directive({
  selector: '[ndwuComboboxInput]',
  host: {
    'role': 'combobox',
    '[attr.tabindex]': 'combobox.disabled() ? -1 : 0',
    '[attr.aria-expanded]': 'combobox.expanded() ? "true" : "false"',
    '[attr.aria-haspopup]': '"listbox"',
    '[attr.aria-disabled]': 'combobox.disabled() ? "true" : null',
    '[attr.aria-controls]': 'combobox.listboxId()',
    '[attr.aria-activedescendant]': 'combobox.activeDescendantId()',
    '[attr.aria-autocomplete]': 'combobox.readonly() ? "none" : "list"',
    '(keydown)': 'onKeydown($event)',
    '(click)': 'onClick()',
  },
  exportAs: 'ndwuComboboxInput',
})
export class NdwuComboboxInputDirective {
  public readonly combobox = inject(NdwuComboboxDirective);

  public readonly value = model<string>('');

  protected onKeydown(event: KeyboardEvent): void {
    // `Escape` closes the popup
    if (event.key === 'Escape' && this.combobox.expanded()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.combobox.close();

      return;
    }

    // `Tab` closes the popup (w/o focusing on the combobox input)
    if (event.key === 'Tab' && this.combobox.expanded()) {
      this.combobox.close({focusOrigin: false});

      return;
    }

    // `Alt` + `Up Arrow` closes the popup.
    if (event.altKey && event.key === 'ArrowUp' && this.combobox.expanded()) {
      event.preventDefault();
      this.combobox.close();

      return;
    }

    // `Alt` + `Down Arrow` opens the popup without activating an option.
    if (event.altKey && event.key === 'ArrowDown' && !this.combobox.expanded()) {
      event.preventDefault();
      this.combobox.open('alt-arrow');

      return;
    }

    if (this.combobox.expanded() && this.forwardToListbox(event)) {
      return;
    }

    this.handleClosedKeydown(event);
  }

  /**
   * Forwards applicable keys to the registered listbox when the popup is open.
   *
   * In readonly mode (acting as `<select>`), all navigation keys are forwarded.
   * In editable mode, only vertical arrows and `Enter` are forwarded so that
   * `ArrowLeft`/`ArrowRight`, `Home`/`End`, and `Space` remain available for text editing.
   *
   * @returns `true` if the event was consumed.
   */
  private forwardToListbox(event: KeyboardEvent): boolean {
    const listbox = this.combobox.listbox();

    if (!listbox) {
      return false;
    }

    const forwardedKeys = this.combobox.readonly()
      ? ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' ']
      : ['ArrowDown', 'ArrowUp', 'Enter'];

    // "Type a letter to jump to a matching option" — like a native <select>.
    // We only do this when the field is readonly (you pick from the list, you can't type
    // into it). If it's an editable field, letters should go into the text box instead, so
    // we leave them alone here.
    // The checks below mean: it's readonly, AND the key is a single character like "a" (not
    // "ArrowDown" or "F5"), AND no Ctrl/Cmd/Alt is held (so we don't hijack Ctrl+A, Cmd+C, etc.).
    // When true, we hand the letter to the list, which highlights the first option that starts with it.
    const isTypeaheadChar = this.combobox.readonly()
      && event.key.length === 1
      && !event.ctrlKey && !event.metaKey && !event.altKey;

    if (forwardedKeys.includes(event.key) || isTypeaheadChar) {
      event.preventDefault();
      event.stopPropagation();
      listbox.handleKeydown(event);

      return true;
    }

    return false;
  }

  /** Handles keys that open the popup when it is currently closed. */
  private handleClosedKeydown(event: KeyboardEvent): void {
    if (this.combobox.readonly()) {
      this.handleReadonlyClosedKeydown(event);
    } else if (event.key === 'ArrowDown' && !this.combobox.expanded()) {
      event.preventDefault();
      this.combobox.open('arrow-down');
    }
  }

  private handleReadonlyClosedKeydown(event: KeyboardEvent): void {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();

      if (!this.combobox.expanded()) {
        this.combobox.open(this.openCauseForKey(event.key));
      }

      return;
    }

    // WAI-ARIA "combobox": printable characters open the popup and
    // activate the first matching option (typeahead).
    if (
      event.key.length === 1
      && !event.ctrlKey && !event.metaKey && !event.altKey
      && !this.combobox.expanded()
    ) {
      this.combobox.open('type', event);
    }
  }

  private openCauseForKey(key: string): string {
    switch (key) {
      case 'ArrowUp':
        return 'arrow-up';
      case 'Enter':
        return 'enter';
      case ' ':
        return 'space';
      case 'Home':
        return 'home';
      case 'End':
        return 'end';
      default:
        return 'arrow-down';
    }
  }

  protected onClick(): void {
    if (this.combobox.disabled()) {
      return;
    }

    if (this.combobox.readonly()) {
      if (this.combobox.expanded()) {
        this.combobox.close();
      } else {
        this.combobox.open('mouse');
      }
    } else if (!this.combobox.expanded()) {
      this.combobox.open('mouse');
    }
  }
}

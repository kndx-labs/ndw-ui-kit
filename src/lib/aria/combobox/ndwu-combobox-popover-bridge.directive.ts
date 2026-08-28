import {Directive, effect, inject, untracked} from '@angular/core';
import {NdwuComboboxDirective} from './ndwu-combobox.directive';
import {NdwuPopoverTriggerDirective} from '@ndw-ui-kit/core/popover';

/**
 * Bridges the ARIA combobox expanded state with the popover trigger's
 * open/close lifecycle. Place on the element that carries both
 * [ndwuCombobox] and [ndwuPopoverTrigger]. Keeps the two systems
 * decoupled — the combobox knows nothing about overlays, the popover
 * knows nothing about ARIA.
 */
@Directive({
  selector: '[ndwuComboboxPopoverBridge]',
})
export class NdwuComboboxPopoverBridgeDirective {
  private readonly combobox = inject(NdwuComboboxDirective);
  private readonly popoverTrigger = inject(NdwuPopoverTriggerDirective);

  constructor() {
    // Combobox -> Popover: when expanded changes, sync overlay.
    effect(() => {
      const expanded = this.combobox.expanded();

      if (expanded && !untracked(() => this.popoverTrigger.isOpen())) {
        this.popoverTrigger.toggle();
      } else if (!expanded && untracked(() => this.popoverTrigger.isOpen())) {
        this.popoverTrigger.close(untracked(() => this.combobox.lastCloseOptions()));
      }
    });

    // Popover -> Combobox: when overlay closes externally, sync expanded.
    effect(() => {
      const isOpen = this.popoverTrigger.isOpen();

      if (!isOpen && untracked(() => this.combobox.expanded())) {
        this.combobox.expanded.set(false);
      }
    });
  }
}

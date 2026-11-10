import {ChangeDetectionStrategy, Component, TemplateRef, signal, viewChild} from '@angular/core';
import {NdwuButtonComponent} from '@ndw-ui-kit/core';
import {
  NDWU_POPOVER_CONTROLLER_FACTORY,
  NdwuPopoverTriggerDirective,
  ndwuCreateDropdownController,
} from '@ndw-ui-kit/core/popover';

type SbContextMenuAction = 'Cut' | 'Copy' | 'Paste' | 'Select all' | 'Delete';

interface SbContextMenuContext {
  execute: (action: SbContextMenuAction) => void;
}

export const CONTEXT_MENU_TEMPLATE = `<div
  #inputTarget
  class="target"
  ndwuPopoverTrigger
  triggerOn="manual"
  [popoverControllerFactory]="ndwuCreateDropdownController"
  (contextmenu)="openAt(inputTrigger(), $event)"
>
  Right-click here: the factory comes from the popoverControllerFactory input
</div>
<div
  #tokenTarget
  class="target"
  ndwuPopoverTrigger
  triggerOn="manual"
  (contextmenu)="openAt(tokenTrigger(), $event)"
>
  Right-click here: the factory comes from the NDWU_POPOVER_CONTROLLER_FACTORY token
</div>
<button
  #buttonTarget
  ndwu-button
  variant="secondary"
  label="Open menu"
  aria-haspopup="menu"
  [attr.aria-expanded]="buttonTrigger().isOpen()"
  [ndwuPopoverTrigger]="menu"
  [popoverContext]="buttonMenuContext"
  [popoverControllerFactory]="ndwuCreateDropdownController"
  [popoverCloseOnOriginClick]="false"
  [popoverTrapFocus]="true"
></button>
<p class="sb-note" aria-live="polite">Last action: {{ lastAction() }}</p>
<ng-template #menu let-execute="execute">
  <div class="menu" role="menu" aria-label="Edit" tabindex="-1" (keydown)="moveFocus($event)">
    <button type="button" class="menu-item" role="menuitem" (click)="execute('Cut')">Cut</button>
    <button type="button" class="menu-item" role="menuitem" (click)="execute('Copy')">Copy</button>
    <button type="button" class="menu-item" role="menuitem" (click)="execute('Paste')">Paste</button>
    <button type="button" class="menu-item" role="menuitem" (click)="execute('Select all')">Select all</button>
    <button type="button" class="menu-item" role="menuitem" (click)="execute('Delete')">Delete</button>
  </div>
</ng-template>`;

@Component({
  selector: 'sb-context-menu',
  template: CONTEXT_MENU_TEMPLATE,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .target {
      box-sizing: border-box;
      width: 100%;
      max-width: 480px;
      min-height: 120px;
      padding: 16px;
      border: 2px dashed var(--ndwu-color-gray-30);
      border-radius: 8px;
      color: var(--ndwu-color-gray-80);
      font: 14px / 20px Roboto, sans-serif;
      overflow-wrap: anywhere;
      cursor: context-menu;
    }

    .menu {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      min-width: 200px;
      padding: 4px 0;
      border: 1px solid var(--ndwu-popover-border-color);
      border-radius: var(--ndwu-popover-border-radius);
      background: var(--ndwu-popover-bg);
    }

    .menu-item {
      padding: 8px 12px;
      border: none;
      background: none;
      color: var(--ndwu-popover-text-color);
      font: 14px / 20px Roboto, sans-serif;
      text-align: left;
      cursor: pointer;
    }

    .menu-item:hover {
      background: var(--ndwu-color-gray-5);
    }

    .menu-item:focus-visible {
      outline: none;
      box-shadow: var(--ndwu-fx-focused-default);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuButtonComponent, NdwuPopoverTriggerDirective],
  providers: [{provide: NDWU_POPOVER_CONTROLLER_FACTORY, useValue: ndwuCreateDropdownController}],
})
export class SbContextMenuComponent {
  protected readonly ndwuCreateDropdownController = ndwuCreateDropdownController;

  protected readonly inputTrigger = viewChild.required('inputTarget', {read: NdwuPopoverTriggerDirective});

  protected readonly tokenTrigger = viewChild.required('tokenTarget', {read: NdwuPopoverTriggerDirective});

  protected readonly buttonTrigger = viewChild.required('buttonTarget', {read: NdwuPopoverTriggerDirective});

  protected readonly lastAction = signal<SbContextMenuAction | 'none'>('none');

  protected readonly buttonMenuContext: SbContextMenuContext = {
    execute: (action) => {
      this.execute(action, this.buttonTrigger());
    },
  };

  private readonly menuTemplate = viewChild.required<TemplateRef<SbContextMenuContext>>('menu');

  protected openAt(trigger: NdwuPopoverTriggerDirective, event: MouseEvent): void {
    event.preventDefault();

    const context: SbContextMenuContext = {
      execute: (action) => {
        this.execute(action, trigger);
      },
    };

    trigger.open({
      content: this.menuTemplate(),
      context,
      trapFocus: true,
      closeOnOriginClick: false,
      originPoint: {clientX: event.clientX, clientY: event.clientY},
    });
  }

  protected moveFocus(event: KeyboardEvent): void {
    const items = [...(event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="menuitem"]')];
    const current = items.indexOf(document.activeElement as HTMLElement);
    const last = items.length - 1;
    const targets: Partial<Record<string, number>> = {
      ArrowDown: current === last ? 0 : current + 1,
      ArrowUp: current <= 0 ? last : current - 1,
      Home: 0,
      End: last,
    };
    const target = targets[event.key];

    if (target === undefined) {
      return;
    }

    event.preventDefault();
    items[target]?.focus();
  }

  private execute(action: SbContextMenuAction, trigger: NdwuPopoverTriggerDirective): void {
    this.lastAction.set(action);
    trigger.close();
  }
}

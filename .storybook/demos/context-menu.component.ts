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

@Component({
  selector: 'sb-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.scss',
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

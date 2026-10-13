import {ChangeDetectionStrategy, Component, HostListener, TemplateRef, signal, viewChild} from '@angular/core';
import {
  NDWU_POPOVER_CONTROLLER_FACTORY,
  NdwuPopoverControllerFactory,
  NdwuPopoverTriggerDirective,
  ndwuCreateDropdownController,
} from '@ndw-ui-kit/core/popover';

type ContextAction = 'cut' | 'copy' | 'paste' | 'selectAll' | 'delete';

interface ContextMenuContext {
  close: () => void;
  execute: (action: ContextAction) => void;
}

/**
 * Demonstrates two ways to wire a controller factory to NdwuPopoverTriggerDirective:
 *
 * 1. Input-based ([popoverControllerFactory] input) — factory is explicit in the template.
 *    Preferred for direct template usage.
 *
 * 2. DI token (NDWU_POPOVER_CONTROLLER_FACTORY provided at component level) — factory is
 *    injected implicitly. Required when using hostDirectives wrappers (e.g. ndwuTooltip),
 *    since Angular does not support passing inputs to hostDirectives from the host providers.
 */
@Component({
  selector: 'app-context-menu-showcase',
  templateUrl: './context-menu-showcase.component.html',
  styleUrl: './context-menu-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuPopoverTriggerDirective],
  providers: [
    // DI token approach: the trigger directive injected below picks this up automatically.
    {provide: NDWU_POPOVER_CONTROLLER_FACTORY, useValue: ndwuCreateDropdownController},
  ],
})
export class ContextMenuShowcaseComponent {
  // [popoverControllerFactory] input approach: the reference passed directly in the template.
  protected readonly ndwuCreateDropdownController: NdwuPopoverControllerFactory = ndwuCreateDropdownController;

  protected readonly inputBasedTriggerRef = viewChild('inputBasedTrigger', {read: NdwuPopoverTriggerDirective});
  protected readonly diBasedTriggerRef = viewChild('diBasedTrigger', {read: NdwuPopoverTriggerDirective});
  protected readonly menuTpl = viewChild<TemplateRef<ContextMenuContext>>('menuTpl');
  protected readonly actionLog = signal<string[]>([]);

  protected onInputBasedContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.openMenu(this.inputBasedTriggerRef(), event);
  }

  protected onDiBasedContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.openMenu(this.diBasedTriggerRef(), event);
  }

  private openMenu(trigger: NdwuPopoverTriggerDirective | undefined, event: MouseEvent): void {
    const tpl = this.menuTpl();

    if (!trigger || !tpl) {
      return;
    }

    const close = (): void => trigger.close();
    const execute = (action: ContextAction): void => {
      this.logAction(action);
      close();
    };

    trigger.open({
      content: tpl,
      context: {close, execute},
      panelClass: ['ndwu-context-menu-panel'],
      minWidth: 200,
      trapFocus: true,
      closeOnOriginClick: false,
      originPoint: {clientX: event.clientX, clientY: event.clientY},
    });
  }

  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!event.ctrlKey && event.key !== 'Delete') {
      return;
    }

    const anyOpen = (this.inputBasedTriggerRef()?.isOpen() ?? false)
      || (this.diBasedTriggerRef()?.isOpen() ?? false);

    if (anyOpen) {
      return;
    }

    let action: ContextAction | null = null;

    if (event.ctrlKey && event.key === 'x') {
      event.preventDefault();
      action = 'cut';
    } else if (event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      action = 'copy';
    } else if (event.ctrlKey && event.key === 'v') {
      event.preventDefault();
      action = 'paste';
    } else if (event.ctrlKey && event.key === 'a') {
      event.preventDefault();
      action = 'selectAll';
    } else if (event.key === 'Delete') {
      event.preventDefault();
      action = 'delete';
    }

    if (action) {
      this.logAction(action);
    }
  }

  private logAction(action: ContextAction): void {
    const label = this.getActionLabel(action);

    this.actionLog.update((log) => [...log, `${new Date().toLocaleTimeString()}: ${label}`]);
  }

  private getActionLabel(action: ContextAction): string {
    const labels: Record<ContextAction, string> = {
      cut: 'Cut',
      copy: 'Copy',
      paste: 'Paste',
      selectAll: 'Select All',
      delete: 'Delete',
    };

    return labels[action];
  }

  protected clearLog(): void {
    this.actionLog.set([]);
  }
}

import {Directive, type Provider, type TemplateRef, computed, inject, input} from '@angular/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {
  NDWU_POPOVER_CONTROLLER_FACTORY,
  NDWU_POPOVER_DEFAULT_CONTENT,
  NDWU_POPOVER_TRIGGER_DEFAULTS,
  NdwuPopoverTriggerDirective,
  ndwuCreatePopoverController,
} from '@ndw-ui-kit/core/popover';
import {NdwuPopoverComponent} from './ndwu-popover.component';
import type {NdwuPopoverAlign, NdwuPopoverButton, NdwuPopoverSide} from './ndwu-popover.types';
import {
  NDWU_POPOVER_BODY,
  NDWU_POPOVER_BUTTONS,
  NDWU_POPOVER_CLOSE_ARIA_LABEL,
  NDWU_POPOVER_CLOSE_FN,
  NDWU_POPOVER_ID,
  NDWU_POPOVER_SHOW_CLOSE,
  NDWU_POPOVER_SHOW_HEADER,
  NDWU_POPOVER_TITLE,
} from './ndwu-popover.tokens';

const DEFAULT_TRIGGERS = ['click'] as const;
const DEFAULT_POPOVER_CLASS = 'ndwu-popover';
const DEFAULT_POPOVER_SIDE = 'bottom' as const;
const DEFAULT_POPOVER_ALIGN = 'center' as const;

@Directive({
  selector: '[ndwuPopover]',
  host: {
    '[attr.aria-expanded]': 'ariaExpanded()',
    '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-controls]': 'popoverId',
  },
  hostDirectives: [
    {
      directive: NdwuPopoverTriggerDirective,
      inputs: [
        'showDelay',
        'hideDelay',
        'popoverClass',
        'popoverTrapFocus',
        'triggerOn',
      ],
    },
  ],
  providers: [
    {
      provide: NDWU_POPOVER_CONTROLLER_FACTORY,
      useValue: ndwuCreatePopoverController,
    },
    {
      provide: NDWU_POPOVER_TRIGGER_DEFAULTS,
      useValue: {
        triggerOn: DEFAULT_TRIGGERS,
        popoverClass: [DEFAULT_POPOVER_CLASS],
        popoverTrapFocus: true,
      },
    },
    {
      provide: NDWU_POPOVER_DEFAULT_CONTENT,
      useFactory: () => () => NdwuPopoverComponent,
    },
  ],
})
export class NdwuPopoverDirective {
  private readonly trigger = inject(NdwuPopoverTriggerDirective);

  protected readonly popoverId = uniqueId('ndwu-popover-');

  protected readonly ariaExpanded = computed(() => {
    return this.trigger.isOpen() ? 'true' : 'false';
  });

  public readonly ndwuPopover = input.required<TemplateRef<unknown> | string>();

  public readonly popoverTitle = input<string>('');
  public readonly popoverShowHeader = input<boolean>(false);
  public readonly popoverShowClose = input<boolean>(true);
  public readonly popoverCloseButtonAriaLabel = input<string>('Close');
  public readonly popoverButtons = input<NdwuPopoverButton[]>([]);
  public readonly popoverSide = input<NdwuPopoverSide>(DEFAULT_POPOVER_SIDE);
  public readonly popoverAlign = input<NdwuPopoverAlign>(DEFAULT_POPOVER_ALIGN);

  public readonly showDelay = input<number>(0);
  public readonly hideDelay = input<number>(0);
  public readonly popoverClass = input<string | string[]>([DEFAULT_POPOVER_CLASS]);
  public readonly popoverTrapFocus = input<boolean>(true);
  public readonly triggerOn = input(DEFAULT_TRIGGERS as readonly string[]);

  constructor() {
    this.trigger.registerOverlayConfig(() => {
      return {
        providers: this.getProviders(),
        controllerConfig: {
          popoverSide: this.popoverSide(),
          popoverAlign: this.popoverAlign(),
        },
      };
    });
  }

  public getProviders(): Provider[] {
    return [
      {provide: NDWU_POPOVER_BODY, useValue: this.ndwuPopover()},
      {provide: NDWU_POPOVER_ID, useValue: this.popoverId},
      {provide: NDWU_POPOVER_TITLE, useValue: this.popoverTitle()},
      {provide: NDWU_POPOVER_SHOW_HEADER, useValue: this.popoverShowHeader()},
      {provide: NDWU_POPOVER_SHOW_CLOSE, useValue: this.popoverShowClose()},
      {provide: NDWU_POPOVER_CLOSE_ARIA_LABEL, useValue: this.popoverCloseButtonAriaLabel()},
      {provide: NDWU_POPOVER_BUTTONS, useValue: this.popoverButtons()},
      {provide: NDWU_POPOVER_CLOSE_FN, useValue: () => this.trigger.close()},
    ];
  }
}

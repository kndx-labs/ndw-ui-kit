import {Directive, type Provider, inject, input} from '@angular/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {
  NDWU_POPOVER_CONTROLLER_FACTORY,
  NDWU_POPOVER_DEFAULT_CONTENT,
  NDWU_POPOVER_TRIGGER_DEFAULTS,
  type NdwuPopoverAlign,
  NdwuPopoverTriggerDirective,
  type NdwuPopoverTriggerType,
  type NdwuTooltipPosition,
  createTooltipController,
} from '@ndw-ui-kit/core/popover';
import {NdwuTooltipComponent} from './ndwu-tooltip.component';
import {NDWU_TOOLTIP_CONTENT, NDWU_TOOLTIP_ID, NDWU_TOOLTIP_MAX_WIDTH} from './ndwu-tooltip.tokens';

const DEFAULT_TRIGGERS = ['hover'] as const;
const TOUCH_TRIGGERS = ['click'] as const;
const DEFAULT_POPOVER_CLASS = 'ndwu-tooltip';
const DEFAULT_SHOW_DELAY = 300;
const DEFAULT_HIDE_DELAY = 200;

/** Devices with no real hover (phones, tablets) can't reach a hover-only tooltip, so they need tap instead. */
function defaultTooltipTriggers(): NdwuPopoverTriggerType[] {
  const isTouchOnly = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  return isTouchOnly ? [...TOUCH_TRIGGERS] : [...DEFAULT_TRIGGERS];
}

@Directive({
  selector: '[ndwuTooltip]',
  hostDirectives: [
    {
      directive: NdwuPopoverTriggerDirective,
      inputs: [
        'showDelay',
        'hideDelay',
        'popoverClass',
        'popoverTrapFocus',
        'triggerOn',
        'showOnTap',
      ],
    },
  ],
  host: {
    '[attr.aria-describedby]': 'tooltipId',
  },
  providers: [
    {
      provide: NDWU_POPOVER_CONTROLLER_FACTORY,
      useValue: createTooltipController,
    },
    {
      provide: NDWU_POPOVER_TRIGGER_DEFAULTS,
      useFactory: () => ({
        triggerOn: defaultTooltipTriggers(),
        showDelay: DEFAULT_SHOW_DELAY,
        hideDelay: DEFAULT_HIDE_DELAY,
        popoverClass: [DEFAULT_POPOVER_CLASS],
        popoverTrapFocus: false,
      }),
    },
    {
      provide: NDWU_POPOVER_DEFAULT_CONTENT,
      useFactory: () => () => NdwuTooltipComponent,
    },
  ],
})
export class NdwuTooltipDirective {
  private readonly trigger = inject(NdwuPopoverTriggerDirective);

  public readonly ndwuTooltip = input.required<string>();

  public readonly showDelay = input<number>(DEFAULT_SHOW_DELAY);
  public readonly hideDelay = input<number>(DEFAULT_HIDE_DELAY);
  public readonly triggerOn = input<NdwuPopoverTriggerType | NdwuPopoverTriggerType[]>(defaultTooltipTriggers());
  public readonly popoverClass = input<string | string[]>([DEFAULT_POPOVER_CLASS]);
  public readonly popoverTrapFocus = input<boolean>(false);
  public readonly showOnTap = input<boolean>(false);
  public readonly tooltipMaxWidth = input<string | null>(null);
  public readonly tooltipPosition = input<NdwuTooltipPosition>('auto');
  public readonly tooltipAlign = input<NdwuPopoverAlign>('center');

  protected readonly tooltipId = uniqueId('ndwu-tooltip-');

  constructor() {
    this.trigger.registerOverlayConfig(() => this.buildOverlayConfig());
  }

  private buildOverlayConfig() {
    return {
      providers: this.getProviders(),
      controllerConfig: {
        tooltipPosition: this.tooltipPosition(),
        tooltipAlign: this.tooltipAlign(),
      },
    };
  }

  public getProviders(): Provider[] {
    return [
      {provide: NDWU_TOOLTIP_ID, useValue: this.tooltipId},
      {provide: NDWU_TOOLTIP_CONTENT, useValue: this.ndwuTooltip()},
      {provide: NDWU_TOOLTIP_MAX_WIDTH, useValue: this.tooltipMaxWidth()},
    ];
  }
}

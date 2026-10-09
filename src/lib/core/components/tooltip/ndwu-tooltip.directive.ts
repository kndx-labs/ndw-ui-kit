import {
  Directive,
  ElementRef,
  type Provider,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {
  NDWU_POPOVER_CONTROLLER_FACTORY,
  NDWU_POPOVER_DEFAULT_CONTENT,
  NDWU_POPOVER_TRIGGER_DEFAULTS,
  type NdwuOverlayConfig,
  type NdwuPopoverAlign,
  type NdwuPopoverOrigin,
  NdwuPopoverTriggerDirective,
  type NdwuPopoverTriggerType,
  type NdwuTooltipPosition,
  createTooltipController,
} from '@ndw-ui-kit/core/popover';
import {NdwuTooltipComponent} from './ndwu-tooltip.component';
import {
  NDWU_TOOLTIP_CONTENT,
  NDWU_TOOLTIP_CONTEXT,
  NDWU_TOOLTIP_ID,
  NDWU_TOOLTIP_LIVE,
  NDWU_TOOLTIP_MAX_WIDTH,
  type NdwuTooltipContent,
} from './ndwu-tooltip.tokens';

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

/**
 * Tooltip trigger. Content is a string or a template (rendered with `tooltipContext` as `$implicit`).
 *
 * One trigger can serve many targets (e.g. cells of a chart): set `tooltipOrigin` to the active
 * target — the open tooltip follows it without closing — put `tooltipId` into the target's
 * `aria-describedby` and set `tooltipDescribeHost` to false. With roving focus, set
 * `tooltipRestoreFocus` to false so closing doesn't move focus back to the trigger.
 */
@Directive({
  selector: '[ndwuTooltip]',
  exportAs: 'ndwuTooltip',
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
    '[attr.aria-describedby]': 'tooltipDescribeHost() ? tooltipId : null',
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
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  public readonly ndwuTooltip = input.required<NdwuTooltipContent>();
  /** Value passed to a template `ndwuTooltip` as `$implicit`; the open tooltip re-renders on change. */
  public readonly tooltipContext = input<unknown>(undefined);
  /** Element or viewport point to anchor the tooltip to instead of the host; re-anchors while open. */
  public readonly tooltipOrigin = input<NdwuPopoverOrigin | null>(null);
  /** Whether the host gets `aria-describedby` pointing to the tooltip. */
  public readonly tooltipDescribeHost = input<boolean>(true);
  /** Whether closing the tooltip (Escape, `hide()`) moves focus back to the host. */
  public readonly tooltipRestoreFocus = input<boolean>(true);

  public readonly showDelay = input<number>(DEFAULT_SHOW_DELAY);
  public readonly hideDelay = input<number>(DEFAULT_HIDE_DELAY);
  public readonly triggerOn = input<NdwuPopoverTriggerType | NdwuPopoverTriggerType[]>(defaultTooltipTriggers());
  public readonly popoverClass = input<string | string[]>([DEFAULT_POPOVER_CLASS]);
  public readonly popoverTrapFocus = input<boolean>(false);
  public readonly showOnTap = input<boolean>(false);
  public readonly tooltipMaxWidth = input<string | null>(null);
  public readonly tooltipPosition = input<NdwuTooltipPosition>('auto');
  public readonly tooltipAlign = input<NdwuPopoverAlign>('center');

  // Template or external-target tooltips are announced via aria-describedby on the target;
  // a live region on top of that would re-announce on every target change.
  private readonly isLive = computed(() => {
    return !(this.ndwuTooltip() instanceof TemplateRef) && this.tooltipOrigin() === null;
  });

  /** ID of the tooltip element, for `aria-describedby` on targets other than the host. */
  public readonly tooltipId = uniqueId('ndwu-tooltip-');

  constructor() {
    this.trigger.registerOverlayConfig(() => this.buildOverlayConfig());

    // Clearing the origin re-anchors to the host, matching what a fresh open would do.
    effect(() => {
      const origin = this.tooltipOrigin() ?? this.hostRef;

      untracked(() => this.trigger.setOrigin(origin));
    });
  }

  /** Opens the tooltip immediately (no show delay), e.g. with `triggerOn="manual"`. */
  public show(): void {
    this.trigger.open({content: NdwuTooltipComponent});
  }

  /** Closes the tooltip. Focus is not moved. */
  public hide(): void {
    this.trigger.close({focusOrigin: false});
  }

  /** Opens after `showDelay`; when already open, only cancels a pending hide (instant re-anchor). */
  public scheduleShow(): void {
    this.trigger.scheduleShow();
  }

  /** Closes after `hideDelay`, unless the pointer moves onto the tooltip or `scheduleShow()` is called. */
  public scheduleHide(): void {
    this.trigger.scheduleHide();
  }

  private buildOverlayConfig(): NdwuOverlayConfig {
    const originConfig = this.buildOriginConfig(this.tooltipOrigin());

    return {
      providers: this.getProviders(),
      controllerConfig: {
        tooltipPosition: this.tooltipPosition(),
        tooltipAlign: this.tooltipAlign(),
        restoreFocus: this.tooltipRestoreFocus(),
      },
      ...originConfig,
    };
  }

  /** Maps `tooltipOrigin` to the matching config field; no origin means the host is the anchor. */
  private buildOriginConfig(
    origin: NdwuPopoverOrigin | null,
  ): Pick<NdwuOverlayConfig, 'originPoint' | 'originElement'> {
    if (origin === null) {
      return {};
    }

    if ('clientX' in origin) {
      return {originPoint: origin};
    }

    return {originElement: origin};
  }

  public getProviders(): Provider[] {
    return [
      {provide: NDWU_TOOLTIP_ID, useValue: this.tooltipId},
      {provide: NDWU_TOOLTIP_CONTENT, useValue: this.ndwuTooltip()},
      {provide: NDWU_TOOLTIP_CONTEXT, useValue: this.tooltipContext},
      {provide: NDWU_TOOLTIP_LIVE, useValue: this.isLive},
      {provide: NDWU_TOOLTIP_MAX_WIDTH, useValue: this.tooltipMaxWidth()},
    ];
  }
}

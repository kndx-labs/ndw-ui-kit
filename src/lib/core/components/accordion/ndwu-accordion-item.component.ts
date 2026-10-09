import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {NdwuAccordionContentDirective} from './ndwu-accordion.directives';
import {
  NDWU_ACCORDION,
  NDWU_ACCORDION_CHEVRON_POSITION,
  type NdwuAccordionChevronPosition,
} from './ndwu-accordion.types';

@Component({
  selector: 'ndwu-accordion-item',
  templateUrl: './ndwu-accordion-item.component.html',
  styleUrl: './ndwu-accordion-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, NdwuIconComponent],
  host: {
    '[class]': 'hostClass()',
  },
})
export class NdwuAccordionItemComponent {
  protected readonly componentId = uniqueId('ndwu-accordion-item-');
  protected readonly headerId = `${this.componentId}-header`;
  protected readonly panelId = `${this.componentId}-panel`;

  public readonly expanded = model(false);
  public readonly disabled = input(false, {transform: booleanAttribute});
  /** Overrides `chevronPosition` of the parent accordion. */
  public readonly chevronPosition = input<NdwuAccordionChevronPosition | null>(null);

  protected readonly accordion = inject(NDWU_ACCORDION, {optional: true});
  protected readonly contentTemplate = contentChild(NdwuAccordionContentDirective);
  protected readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  /** Lazy content stays rendered after the first expand. */
  protected readonly contentRendered = signal(false);

  protected readonly effectiveChevronPosition = computed(() => {
    return this.chevronPosition()
      ?? this.accordion?.chevronPosition()
      ?? NDWU_ACCORDION_CHEVRON_POSITION.START;
  });

  protected readonly hostClass = computed(() => {
    const classes = [
      'ndwu-accordion-item',
      `ndwu-accordion-item--chevron-${this.effectiveChevronPosition()}`,
    ];

    if (this.accordion) {
      classes.push('ndwu-accordion-item--in-group');
    }

    if (this.expanded()) {
      classes.push('ndwu-accordion-item--expanded');
    }

    if (this.disabled()) {
      classes.push('ndwu-accordion-item--disabled');
    }

    return classes.join(' ');
  });

  constructor() {
    effect(() => {
      if (this.expanded()) {
        this.contentRendered.set(true);
      }
    });
  }

  public toggle(): void {
    if (this.disabled()) {
      return;
    }

    this.expanded.update((value) => !value);
  }

  public focus(): void {
    this.trigger().nativeElement.focus();
  }

  /** Used by the parent accordion for keyboard navigation. */
  public isTrigger(target: EventTarget | null): boolean {
    return target === this.trigger().nativeElement;
  }
}

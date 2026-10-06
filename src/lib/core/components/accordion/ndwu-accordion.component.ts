import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  contentChildren,
  effect,
  input,
  untracked,
} from '@angular/core';
import {NdwuAccordionItemComponent} from './ndwu-accordion-item.component';
import {
  NDWU_ACCORDION,
  NDWU_ACCORDION_CHEVRON_POSITION,
  type NdwuAccordionChevronPosition,
  type NdwuAccordionParent,
} from './ndwu-accordion.types';

const NAVIGATION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'Home', 'End']);

@Component({
  selector: 'ndwu-accordion',
  templateUrl: './ndwu-accordion.component.html',
  styleUrl: './ndwu-accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: NDWU_ACCORDION, useExisting: NdwuAccordionComponent},
  ],
  host: {
    'class': 'ndwu-accordion',
    '(keydown)': 'onKeydown($event)',
  },
})
export class NdwuAccordionComponent implements NdwuAccordionParent {
  /** Allows several items to be expanded at the same time. */
  public readonly multi = input(false, {transform: booleanAttribute});
  public readonly chevronPosition = input<NdwuAccordionChevronPosition>(NDWU_ACCORDION_CHEVRON_POSITION.START);

  protected readonly items = contentChildren(NdwuAccordionItemComponent);

  private previousItems = new Set<NdwuAccordionItemComponent>();
  private previouslyExpanded = new Set<NdwuAccordionItemComponent>();

  constructor() {
    // single mode: keep only one item expanded
    effect(() => {
      const items = this.items();
      const multi = this.multi();
      const expanded = items.filter((item) => item.expanded());

      untracked(() => {
        this.enforceSingleExpanded(expanded, multi);
        this.previousItems = new Set(items);
        this.previouslyExpanded = new Set(items.filter((item) => item.expanded()));
      });
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!NAVIGATION_KEYS.has(event.key)) {
      return;
    }

    const focusable = this.items().filter((item) => !item.disabled());
    const currentIndex = focusable.findIndex((item) => item.isTrigger(event.target));

    if (currentIndex === -1) {
      return;
    }

    event.preventDefault();
    focusable[this.getTargetIndex(event.key, currentIndex, focusable.length)]?.focus();
  }

  /**
   * Newly expanded item wins over already expanded ones;
   * otherwise (init, switching `multi` off, several items expanded at once)
   * the first expanded item is kept.
   */
  private enforceSingleExpanded(expanded: NdwuAccordionItemComponent[], multi: boolean): void {
    if (multi || expanded.length < 2) {
      return;
    }

    const newlyExpanded = expanded.filter((item) => {
      return this.previousItems.has(item) && !this.previouslyExpanded.has(item);
    });
    const itemToKeep = newlyExpanded[0] ?? expanded[0];

    for (const item of expanded) {
      if (item !== itemToKeep) {
        item.expanded.set(false);
      }
    }
  }

  private getTargetIndex(key: string, currentIndex: number, count: number): number {
    switch (key) {
      case 'ArrowDown':
        return (currentIndex + 1) % count;
      case 'ArrowUp':
        return (currentIndex - 1 + count) % count;
      case 'Home':
        return 0;
      default:
        return count - 1;
    }
  }
}

import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {type NdwuIconName} from '../../../icon-names';
import {NDWU_SIZE, type NdwuSize} from '../../../shared.types';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {NdwuBadgeComponent, type NdwuBadgeTone} from '../badge/ndwu-badge.component';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {type NdwuTabWidthMode} from './ndwu-tabs.types';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwu-tab-item]',
  templateUrl: './ndwu-tab-item.component.html',
  styleUrl: './ndwu-tab-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuIconComponent, NdwuBadgeComponent, LocalizePipe],
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled() ? true : null',
    '[attr.role]': '"tab"',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-label]': 'label()',
    '[attr.title]': 'label()',
  },
})
export class NdwuTabItemComponent {
  public readonly label = input.required<string>();
  public readonly selected = input(false);
  public readonly disabled = input(false);
  public readonly size = input<NdwuSize>(NDWU_SIZE.L);
  public readonly variant = input<'default' | 'bordered'>('default');
  public readonly icon = input<NdwuIconName | null>(null);
  public readonly badge = input<string | null>(null);
  public readonly badgeTone = input<NdwuBadgeTone>('blue');
  public readonly widthMode = input<NdwuTabWidthMode>('content');

  protected readonly hostClass = computed(() => {
    const classes = [
      'ndwu-tab-item',
      `ndwu-tab-item--size-${this.size()}`,
      `ndwu-tab-item--variant-${this.variant()}`,
    ];

    if (this.selected()) {
      classes.push('ndwu-tab-item--selected');
    }

    if (this.disabled()) {
      classes.push('ndwu-tab-item--disabled');
    }

    if (this.icon()) {
      classes.push('ndwu-tab-item--has-icon');
    }

    if (this.badge()) {
      classes.push('ndwu-tab-item--has-badge');
    }

    if (this.widthMode() === 'fixed') {
      classes.push('ndwu-tab-item--width-fixed');
    } else {
      classes.push('ndwu-tab-item--width-content');
    }

    return classes.join(' ');
  });

  protected readonly effectiveIcon = computed(() => this.icon());

  protected readonly effectiveBadgeTone = computed(() => {
    if (this.disabled()) {
      return 'gray';
    }

    return this.badgeTone();
  });

  protected readonly badgeSize = computed(() => {
    const size = this.size();

    const value = {
      [NDWU_SIZE.S]: NDWU_SIZE.S,
      [NDWU_SIZE.L]: NDWU_SIZE.S,
      [NDWU_SIZE.XL]: NDWU_SIZE.L,
      [NDWU_SIZE.XXL]: NDWU_SIZE.L,
    }[size];

    return value;
  });
}

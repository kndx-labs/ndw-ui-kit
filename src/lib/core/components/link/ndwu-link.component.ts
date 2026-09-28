import {ChangeDetectionStrategy, Component, booleanAttribute, computed, input} from '@angular/core';
import {stopEventImmediately} from '@ndw-ui-kit/core/utils';
import {ICON_NAME, IconName} from '../../../icon-names';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[ndwu-link],a[ndwuLink]',
  templateUrl: './ndwu-link.component.html',
  styleUrl: './ndwu-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuIconComponent],
  host: {
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.tabindex]': 'disabled() ? -1 : null',
    '[attr.target]': 'target()',
    '[attr.rel]': 'effectiveRel()',
    '[class]': 'hostClasses()',
    '(click)': 'onClick($event)',
  },
})
export class NdwuLinkComponent {
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly target = input<string | null>(null);
  public readonly rel = input<string | null>(null);
  public readonly icon = input<IconName | null>(ICON_NAME.EXTERNAL_LINK_S);
  public readonly external = input(false, {transform: booleanAttribute});

  protected readonly hostClasses = computed(() => {
    const classes = ['ndwu-link'];

    if (this.disabled()) {
      classes.push('ndwu-link--disabled');
    }

    return classes.join(' ');
  });

  protected onClick(event: MouseEvent): void {
    if (!this.disabled()) {
      return;
    }

    // Blocks native navigation and listeners added after this one (e.g. RouterLink on the same element)
    stopEventImmediately(event);
  }

  protected readonly effectiveRel = computed(() => {
    const rel = this.rel();
    const target = this.target();

    if (rel) {
      return rel;
    }

    if (target === '_blank') {
      return 'noopener noreferrer';
    }

    return null;
  });
}

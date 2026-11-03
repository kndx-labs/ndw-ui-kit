import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import {blockClicksWhile} from '@ndw-ui-kit/core/utils';
import {NDWU_ICON_NAME, NdwuIconName} from '../../../icon-names';
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
  },
})
export class NdwuLinkComponent {
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly target = input<string | null>(null);
  public readonly rel = input<string | null>(null);
  public readonly icon = input<NdwuIconName | null>(NDWU_ICON_NAME.EXTERNAL_LINK_S);
  public readonly external = input(false, {transform: booleanAttribute});

  protected readonly hostClasses = computed(() => {
    const classes = ['ndwu-link'];

    if (this.disabled()) {
      classes.push('ndwu-link--disabled');
    }

    return classes.join(' ');
  });

  constructor() {
    blockClicksWhile(this.el.nativeElement, this.disabled, this.destroyRef);
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

import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import {ICON_NAME, NdwuIconComponent} from '@ndw-ui-kit/core';

/**
 * Pin toggle for a column header. It only reports intent: the host binds the
 * column def's `sticky`, which is what actually freezes the column.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwuColumnPin]',
  template: '<ndwu-icon [name]="pinned() ? ICON_NAME.UNPIN_S : ICON_NAME.PIN_S" />',
  styleUrl: './ndwu-column-pin.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuIconComponent],
  host: {
    'class': 'ndwu-column-pin',
    'type': 'button',
    '[class.ndwu-column-pin-active]': 'pinned()',
    '[attr.aria-pressed]': 'pinned()',
    '(click)': 'toggle($event)',
  },
})
export class NdwuColumnPinComponent {
  protected readonly ICON_NAME = ICON_NAME;

  public readonly pinned = input(false, {transform: booleanAttribute});
  public readonly pinnedChange = output<boolean>();

  protected toggle(event: Event): void {
    // The pin usually sits inside a sort header, which would otherwise sort.
    event.stopPropagation();
    this.pinnedChange.emit(!this.pinned());
  }
}

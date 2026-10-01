import {ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input} from '@angular/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NDWU_SIZE} from '../../../../shared.types';
import {NdwuLabelGroupComponent} from '../../label-group/ndwu-label-group.component';
import {NDWU_RADIO_GROUP} from '../radio.types';

@Component({
  selector: 'ndwu-radio-button',
  templateUrl: './ndwu-radio-button.component.html',
  styleUrl: './ndwu-radio-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuLabelGroupComponent,
  ],
  host: {
    '[attr.id]': 'null',
    '[attr.aria-describedby]': 'null',
  },
})
export class NdwuRadioButtonComponent {
  public readonly value = input<string | number>('');
  public readonly label = input<string>('');
  public readonly secondaryText = input<string>('');
  public readonly disabled = input(false, {transform: booleanAttribute});

  public readonly ariaDescribedby = input<string | null>(null, {alias: 'aria-describedby'});

  protected readonly componentId = uniqueId('ndwu-radio-');
  private readonly radioGroup = inject(NDWU_RADIO_GROUP, {optional: true});

  public readonly id = input<string>('');

  protected readonly inputId = computed(() => {
    return this.id() || this.componentId;
  });

  protected readonly effectiveRequired = computed(() => {
    return this.radioGroup?.required() ?? false;
  });

  protected readonly effectiveDisabled = computed(() => {
    return this.disabled() || (this.radioGroup?.disabled() ?? false);
  });

  protected readonly isChecked = computed(() => {
    return this.radioGroup?.isSelected(this.value()) ?? false;
  });

  protected readonly groupName = computed(() => {
    return this.radioGroup?.groupName() ?? '';
  });

  protected readonly effectiveSize = computed(() => {
    return this.radioGroup?.effectiveSize() ?? NDWU_SIZE.XL;
  });

  public selectThis(): void {
    if (this.effectiveDisabled()) {
      return;
    }

    this.radioGroup?.select(this.value());
  }
}

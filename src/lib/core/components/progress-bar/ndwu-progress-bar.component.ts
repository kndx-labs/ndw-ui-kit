import {ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input} from '@angular/core';
import {positiveNumberAttribute, uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuSizeDirective} from '../../directives';
import {NDWU_SIZE} from '../../../shared.types';

export const NDWU_PROGRESS_BAR_COLOR = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
} as const;

export type NdwuProgressBarColor = typeof NDWU_PROGRESS_BAR_COLOR[keyof typeof NDWU_PROGRESS_BAR_COLOR];

export const ndwuCoerceProgressBarColor = (value: unknown): NdwuProgressBarColor => {
  const val = value as NdwuProgressBarColor;

  return Object.values(NDWU_PROGRESS_BAR_COLOR).includes(val) ? val : NDWU_PROGRESS_BAR_COLOR.PRIMARY;
};

export type NdwuProgressBarMode = 'determinate' | 'indeterminate';

export const ndwuCoerceProgressBarMode = (value: unknown): NdwuProgressBarMode => {
  const val = value as NdwuProgressBarMode;

  return val === 'indeterminate' ? 'indeterminate' : 'determinate';
};

@Component({
  selector: 'ndwu-progress-bar',
  templateUrl: './ndwu-progress-bar.component.html',
  styleUrl: './ndwu-progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuProgressBarComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly progressBarId: string = uniqueId('ndwu-progress-bar-');

  public readonly value = input(0, {transform: positiveNumberAttribute});
  public readonly max = input(100, {transform: positiveNumberAttribute});
  public readonly color = input(NDWU_PROGRESS_BAR_COLOR.PRIMARY, {transform: ndwuCoerceProgressBarColor});
  public readonly label = input<string>('');
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly mode = input('determinate', {transform: ndwuCoerceProgressBarMode});

  protected readonly isIndeterminate = computed(() => this.mode() === 'indeterminate');

  protected readonly percentage = computed(() => {
    const maxVal = this.max();
    const val = this.value();

    if (maxVal <= 0) {
      return 0;
    }

    return Math.min(100, Math.max(0, (val / maxVal) * 100));
  });

  protected readonly rootClass = computed(() => {
    const classes = [
      'ndwu-progress-bar',
      `ndwu-progress-bar--${this.color()}`,
      `ndwu-progress-bar--${this.sizeSvc.effectiveSize() === NDWU_SIZE.XL ? 'XL' : 'L'}`,
    ];

    if (this.disabled()) {
      classes.push('ndwu-progress-bar--disabled');
    }

    if (this.isIndeterminate()) {
      classes.push('ndwu-progress-bar--indeterminate');
    }

    return classes.join(' ');
  });
}

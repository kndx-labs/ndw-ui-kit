import {ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input} from '@angular/core';
import {positiveNumberAttribute, uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuSizeDirective} from '../../directives';
import {SIZE} from '../../../shared.types';

export const PROGRESS_BAR_COLOR = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
} as const;

export type ProgressBarColor = typeof PROGRESS_BAR_COLOR[keyof typeof PROGRESS_BAR_COLOR];

export const coerceProgressBarColor = (value: unknown): ProgressBarColor => {
  const val = value as ProgressBarColor;

  return Object.values(PROGRESS_BAR_COLOR).includes(val) ? val : PROGRESS_BAR_COLOR.PRIMARY;
};

export type ProgressBarMode = 'determinate' | 'indeterminate';

export const coerceProgressBarMode = (value: unknown): ProgressBarMode => {
  const val = value as ProgressBarMode;

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
  public readonly color = input(PROGRESS_BAR_COLOR.PRIMARY, {transform: coerceProgressBarColor});
  public readonly label = input<string>('');
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly mode = input('determinate', {transform: coerceProgressBarMode});

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
      `ndwu-progress-bar--${this.sizeSvc.effectiveSize() === SIZE.XL ? 'XL' : 'L'}`,
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

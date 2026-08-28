import {ChangeDetectionStrategy, Component, OnDestroy, computed, effect, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {getCoerceToClampedNumberTransform, positiveNumberAttribute} from '@ndw-ui-kit/core/utils';

@Component({
  selector: 'ndwu-spokes-loader',
  templateUrl: './ndwu-spokes-loader.component.html',
  styleUrls: ['./ndwu-spokes-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
  ],
})
export class NdwuSpokesLoaderComponent implements OnDestroy {
  public readonly size = input(20, {transform: positiveNumberAttribute});
  public readonly spokes = input(
    8,
    {
      transform: getCoerceToClampedNumberTransform(8, 3, 12),
    },
  );

  public readonly duration = input(900, {transform: positiveNumberAttribute}); // ms
  public readonly spokeWidth = input(1.5, {transform: positiveNumberAttribute});
  public readonly spokeHeight = input(0, {transform: positiveNumberAttribute});
  public readonly spokeOffset = input<number | null>(null);
  public readonly autostart = input(true);

  protected readonly spokenArray = computed(() => {
    return Array.from({length: this.spokes()}, (_, i) => i);
  });

  protected readonly effectiveSpokeHeight = computed(() => this.spokeHeight() || this.size() * 0.202);
  protected readonly effectiveSpokeOffset = computed(() => this.spokeOffset() ?? this.size() * 0.0865);

  protected animationFrameId?: number;
  protected startTime?: number;
  protected isAnimating = false;

  constructor() {
    effect(() => {
      if (this.autostart()) {
        this.startAnimation();
      }
    });
  }

  public ngOnDestroy(): void {
    this.stopAnimation();
  }

  public startAnimation(): void {
    if (this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    this.startTime = performance.now();

    this.animate();
  }

  public stopAnimation(): void {
    this.isAnimating = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  protected animate = (): void => {
    if (!this.isAnimating) {
      return;
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  protected getSpokeStyle(index: number): Record<string, string> {
    const angle = (360 / this.spokes()) * index;
    const width = `${this.spokeWidth()}px`;
    const height = `${this.effectiveSpokeHeight()}px`;

    return {
      'width': `${this.size()}px`,
      'height': `${this.size()}px`,
      'transform': `rotate(${angle}deg)`,
      '--spoke-width': width,
      '--spoke-height': height,
      '--spoke-offset': `${this.effectiveSpokeOffset()}px`,
    };
  }

  protected getAnimationStyle(): Record<string, string> {
    return {
      '--animation-duration': `${this.duration()}ms`,
      '--spokes-count': String(this.spokes()),
    };
  }
}

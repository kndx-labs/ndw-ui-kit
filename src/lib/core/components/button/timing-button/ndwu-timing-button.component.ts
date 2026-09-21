import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';

import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {IconName} from '../../../../icon-names';
import {SIZE} from '../../../../shared.types';
import {NdwuSizeDirective} from '../../../directives';
import {NdwuIconComponent} from '../../icon/ndwu-icon.component';
import {NdwuSpokesLoaderComponent} from '../../spokes-loader/ndwu-spokes-loader.component';

type TimerState = 'preloading' | 'active' | 'counting';

/**
 * distinguishes how the countdown ended:
 * - 'user'    - the user clicked the button before the timer elapsed;
 * - 'timeout' - the countdown reached zero on its own.
 */
export type TimerEndReason = 'user' | 'timeout';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwu-timing-button],button[ndwuTimingButton]',
  templateUrl: './ndwu-timing-button.component.html',
  styleUrl: './ndwu-timing-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuIconComponent,
    NdwuSpokesLoaderComponent,
  ],
  host: {
    'type': 'button',
    '[class]': 'hostClasses()',
    '[disabled]': 'disabled()',
    '[style.--ndwu-timing-button-fill]': 'fillWidth()',
    '[style.--ndwu-timing-button-width]': 'width()',
    '(click)': 'onButtonClick()',
  },
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuTimingButtonComponent implements OnInit {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly loading = input(false, {transform: booleanAttribute});
  public readonly icon = input<IconName | null>(null);
  public readonly leftText = input<string>('');
  public readonly rightText = input<string>('');
  public readonly duration = input<number>(15);
  public readonly width = input<string | null>(null);

  public readonly timerEnd = output<TimerEndReason>();

  protected readonly remainingSeconds = signal<number>(0);
  protected readonly progress = signal<number>(0);
  protected readonly state = signal<TimerState>('preloading');

  protected readonly timerText = computed(() => `${this.remainingSeconds()}`);
  protected readonly fillWidth = computed(() => `${this.progress() * 100}%`);

  private rafId: ReturnType<typeof requestAnimationFrame> | null = null;
  private startMs = 0;

  constructor() {
    effect(() => {
      const isDisabled = this.disabled();

      untracked(() => {
        if (isDisabled) {
          this.cancelAnimation();
          this.setFillWidth(0);
        } else if (this.state() === 'counting' && this.rafId === null && !this.loading()) {
          this.runAnimation();
        }
      });
    });

    effect(() => {
      if (this.loading()) {
        untracked(() => this.stopCountdown());
      }
    });
  }

  protected readonly loaderParams = computed(() => {
    const size = this.sizeSvc.effectiveSize();

    return size === SIZE.XL || size === SIZE.XXL
      ? {size: 20, spokeWidth: 1.6, spokeHeight: 4.6, spokeOffset: 0.5}
      : {size: 17, spokeWidth: 1.54, spokeHeight: 4.04, spokeOffset: 0.5};
  });

  protected readonly hostClasses = computed(() => {
    const classes = [
      'ndwu-timing-button',
      `ndwu-timing-button--${this.sizeSvc.effectiveSize()}`,
      `ndwu-timing-button--${this.state()}`,
    ];

    if (this.loading()) {
      classes.push('ndwu-timing-button--loading');
    }

    if (this.disabled()) {
      classes.push('ndwu-timing-button--disabled');
    }

    return classes.join(' ');
  });

  public ngOnInit(): void {
    const total = this.duration();

    this.remainingSeconds.set(total);

    queueMicrotask(() => {
      this.state.set('active');

      if (!this.disabled() && total > 0) {
        this.startCountdown();
      }
    });

    this.destroyRef.onDestroy(() => this.stopCountdown());
  }

  protected onButtonClick(): void {
    if (this.state() === 'counting') {
      this.setFillWidth(1);
      this.stopCountdown();
      this.timerEnd.emit('user');
    }
  }

  private startCountdown(): void {
    const total = this.duration();

    this.state.set('counting');
    this.remainingSeconds.set(total);

    if (!this.disabled() && !this.loading()) {
      this.runAnimation();
    }
  }

  private runAnimation(): void {
    const total = this.duration();

    this.startMs = Date.now();

    const tick = (): void => {
      const elapsed = (Date.now() - this.startMs) / 1000;
      const ratio = Math.min(elapsed / total, 1);

      this.setFillWidth(ratio);

      const next = Math.max(total - Math.floor(elapsed), 0);

      if (next !== this.remainingSeconds()) {
        this.remainingSeconds.set(next);
      }

      if (ratio >= 1) {
        this.stopCountdown();
        this.emitNativeClick();
        this.timerEnd.emit('timeout');

        return;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private setFillWidth(ratio: number): void {
    this.progress.set(ratio);

    const nativeElement = this.el.nativeElement;

    if (nativeElement instanceof HTMLButtonElement) {
      nativeElement.style.setProperty('--ndwu-timing-button-fill', `${ratio * 100}%`);
    }
  }

  private emitNativeClick(): void {
    const nativeElement = this.el.nativeElement;

    if (nativeElement instanceof HTMLButtonElement && !nativeElement.disabled) {
      nativeElement.click();
    }
  }

  private cancelAnimation(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private stopCountdown(): void {
    this.cancelAnimation();
    this.state.set('active');
  }
}

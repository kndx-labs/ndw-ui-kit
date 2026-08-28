import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal} from '@angular/core';
import {NdwuProgressBarComponent, PROGRESS_BAR_COLOR, SIZE} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-progress-bar-overview',
  templateUrl: './progress-bar-overview.component.html',
  styleUrl: './progress-bar-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuProgressBarComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class ProgressBarOverviewComponent implements OnInit, OnDestroy {
  public readonly SIZE = SIZE;
  public readonly PROGRESS_BAR_COLOR = PROGRESS_BAR_COLOR;

  public readonly primaryValue = signal(65);
  public readonly successValue = signal(100);
  public readonly dangerValue = signal(45);
  public readonly warningValue = signal(78);

  public readonly animatedValue = signal(0);

  private intervalId?: ReturnType<typeof setInterval>;

  public ngOnInit(): void {
    this.intervalId = setInterval(() => {
      const current = this.animatedValue();
      const increment = Math.floor(Math.random() * 5) + 1;
      const next = current + increment > 100 ? 0 : current + increment;

      this.animatedValue.set(next);
    }, 500);
  }

  public ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

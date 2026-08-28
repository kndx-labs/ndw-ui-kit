import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {NdwuTimingButtonComponent, SIZE} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-timing-button-overview',
  templateUrl: './timing-button-overview.component.html',
  styleUrl: './timing-button-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuTimingButtonComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class TimingButtonOverviewComponent {
  public readonly SIZES = Object.values(SIZE).filter((size) => size !== SIZE.S);

  public timerLoading = signal(false);
  public timerVisible = signal(true);
  public enabledLoading = signal(false);
  public enabledVisible = signal(true);
  public hoverLoading = signal(false);
  public hoverVisible = signal(true);
  public focusLoading = signal(false);
  public focusVisible = signal(true);

  public onTimerEnd(): void {
    this.timerLoading.set(true);
    setTimeout(() => {
      this.timerLoading.set(false);
      this.timerVisible.set(false);
      setTimeout(() => this.timerVisible.set(true));
    }, 2000);
  }

  public onEnabledTimerEnd(): void {
    this.enabledLoading.set(true);
    setTimeout(() => {
      this.enabledLoading.set(false);
      this.enabledVisible.set(false);
      setTimeout(() => this.enabledVisible.set(true));
    }, 2000);
  }

  public onHoverTimerEnd(): void {
    this.hoverLoading.set(true);
    setTimeout(() => {
      this.hoverLoading.set(false);
      this.hoverVisible.set(false);
      setTimeout(() => this.hoverVisible.set(true));
    }, 2000);
  }

  public onFocusTimerEnd(): void {
    this.focusLoading.set(true);
    setTimeout(() => {
      this.focusLoading.set(false);
      this.focusVisible.set(false);
      setTimeout(() => this.focusVisible.set(true));
    }, 2000);
  }
}

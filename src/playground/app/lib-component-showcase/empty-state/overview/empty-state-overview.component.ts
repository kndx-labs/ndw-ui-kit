import {ChangeDetectionStrategy, Component, Signal, computed, signal} from '@angular/core';
import {NdwuButtonComponent, NdwuEmptyStateComponent, Size} from '@ndw-ui-kit/core';
import {NdwuSizeFlags} from '@ndw-ui-kit/core/utils';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-empty-state-overview',
  templateUrl: './empty-state-overview.component.html',
  styleUrl: './empty-state-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuEmptyStateComponent, NdwuButtonComponent, ShowcaseLayoutComponent, LocalizePipe],
})
export class EmptyStateOverviewComponent {
  protected readonly emptyStateIsDesktop = signal(true);
  protected readonly emptyStateIsMobile: Signal<boolean> = computed(() => !this.emptyStateIsDesktop());
  protected readonly emptyStateSizeFlags: NdwuSizeFlags<Size> = {
    XL: this.emptyStateIsDesktop,
    L: this.emptyStateIsMobile,
  };

  protected toggleEmptyStateFlags(): void {
    this.emptyStateIsDesktop.update((isDesktop) => !isDesktop);
  }
}

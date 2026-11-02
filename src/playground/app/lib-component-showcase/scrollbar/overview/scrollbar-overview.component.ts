import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {NdwuScrollbarComponent, NdwuScrollbarPadding} from '@ndw-ui-kit/core';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-scrollbar-overview',
  templateUrl: './scrollbar-overview.component.html',
  styleUrl: './scrollbar-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuScrollbarComponent, ShowcaseLayoutComponent],
})
export class ScrollbarOverviewComponent {
  protected readonly isScrollbarDisabled = signal(false);
  protected readonly isScrollbarAutoHide = signal(false);
  protected readonly edgeActionCount = signal(0);
  protected readonly touchRows = Array.from({length: 16}, (_, index) => index + 1);

  protected readonly pixelTrackPadding: NdwuScrollbarPadding = {
    right: '40px',
    bottom: '32px',
  };

  protected readonly percentTrackPadding: NdwuScrollbarPadding = {
    right: '10%',
    bottom: '10%',
  };

  protected readonly calcTrackPadding: NdwuScrollbarPadding = {
    right: 'calc(8px + 5%)',
    bottom: 'calc(6px + 4%)',
  };

  protected readonly paddingExample: NdwuScrollbarPadding = {
    left: '16px',
    right: '16px',
    top: '8px',
    bottom: '8px',
  };

  protected readonly contentPaddingExample: NdwuScrollbarPadding = {
    left: '16px',
    right: '16px',
    top: '16px',
    bottom: '16px',
  };

  protected toggleScrollbar(): void {
    this.isScrollbarDisabled.update((isDisabled) => !isDisabled);
  }

  protected toggleAutoHide(): void {
    this.isScrollbarAutoHide.update((isAutoHide) => !isAutoHide);
  }

  protected countEdgeAction(): void {
    this.edgeActionCount.update((count) => count + 1);
  }
}

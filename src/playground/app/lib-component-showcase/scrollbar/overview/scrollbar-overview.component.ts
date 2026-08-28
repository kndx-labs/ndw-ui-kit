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
}

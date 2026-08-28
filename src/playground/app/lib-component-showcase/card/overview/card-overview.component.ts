import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NdwuCardComponent, SIZE, type Size} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-card-overview',
  templateUrl: './card-overview.component.html',
  styleUrl: './card-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuCardComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class CardOverviewComponent {
  protected readonly sizes: Size[] = [SIZE.L, SIZE.XL, SIZE.XXL];
}

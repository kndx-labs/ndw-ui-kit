import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NDWU_SIZE, NdwuCardComponent, type NdwuSize} from '@ndw-ui-kit/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-card-overview',
  templateUrl: './card-overview.component.html',
  styleUrl: './card-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuCardComponent,
    NdwuLocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class CardOverviewComponent {
  protected readonly sizes: NdwuSize[] = [NDWU_SIZE.L, NDWU_SIZE.XL, NDWU_SIZE.XXL];
}

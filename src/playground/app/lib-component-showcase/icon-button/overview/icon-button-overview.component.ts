import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NDWU_ICON_BUTTON_VARIANT, NDWU_ICON_NAME, NDWU_SIZE, NdwuIconButtonComponent} from '@ndw-ui-kit/core';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-button-overview',
  templateUrl: './icon-button-overview.component.html',
  styleUrl: './icon-button-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuIconButtonComponent,
    ShowcaseLayoutComponent,
  ],
})
export class IconButtonOverviewComponent {
  public readonly ICON_NAME = NDWU_ICON_NAME;
  public readonly SIZES = Object.values(NDWU_SIZE).filter((size) => size !== NDWU_SIZE.S);
  public readonly VARIANTS = Object.values(NDWU_ICON_BUTTON_VARIANT);
}

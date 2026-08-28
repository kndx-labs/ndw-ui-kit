import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ICON_BUTTON_VARIANT, ICON_NAME, NdwuIconButtonComponent, SIZE} from '@ndw-ui-kit/core';
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
  public readonly ICON_NAME = ICON_NAME;
  public readonly SIZES = Object.values(SIZE).filter((size) => size !== SIZE.S);
  public readonly VARIANTS = Object.values(ICON_BUTTON_VARIANT);
}

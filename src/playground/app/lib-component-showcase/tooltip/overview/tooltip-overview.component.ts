import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ShowcaseLayoutComponent} from '@app/components';
import {
  NDWU_ICON_NAME,
  NdwuButtonComponent,
  NdwuIconComponent,
  NdwuPopoverAlign,
  NdwuTooltipDirective,
} from '@ndw-ui-kit/core';
import {NdwuTooltipPosition} from '@ndw-ui-kit/core/popover';

interface PositionState {
  position: NdwuTooltipPosition;
  align: NdwuPopoverAlign;
}

const SIDES: readonly NdwuTooltipPosition[] = ['above', 'left', 'right', 'below'];
const ALIGNS: readonly NdwuPopoverAlign[] = ['center', 'start', 'end'];

@Component({
  selector: 'app-tooltip-overview',
  templateUrl: './tooltip-overview.component.html',
  styleUrl: './tooltip-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
    NdwuIconComponent,
    NdwuTooltipDirective,
    ShowcaseLayoutComponent,
  ],
})
export class TooltipOverviewComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;

  protected readonly multilineText =
    'Copy hexadecimal value to clipboard Copy hexadecimal value to clipboard value to clipboard '
    + 'value to clipboard value to clipboard value value';

  protected readonly positionStates: readonly PositionState[] = SIDES.flatMap(
    (position) => ALIGNS.map((align) => ({position, align})),
  );
}

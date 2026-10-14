import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NdwuLinkComponent} from '@ndw-ui-kit/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

interface LinkState {
  id: string;
  cssClass: string;
  disabled: boolean;
  external: boolean;
}

const LINK_STATES: readonly LinkState[] = [
  {id: 'state-default', cssClass: '', disabled: false, external: true},
  {id: 'state-hover', cssClass: 'ndwu-link--state-hover', disabled: false, external: false},
  {id: 'state-pressed', cssClass: 'ndwu-link--state-pressed', disabled: false, external: false},
  {id: 'state-focused', cssClass: 'ndwu-link--state-focused', disabled: false, external: false},
  {id: 'state-visited', cssClass: 'ndwu-link--state-visited', disabled: false, external: false},
  {id: 'state-disabled', cssClass: '', disabled: true, external: false},
];

@Component({
  selector: 'app-link-overview',
  templateUrl: './link-overview.component.html',
  styleUrl: './link-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    NdwuLinkComponent,
    RouterLink,
    NdwuLocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class LinkOverviewComponent {
  public readonly STATES = LINK_STATES;
}

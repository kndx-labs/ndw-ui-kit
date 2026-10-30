import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {CdkPortalOutlet} from '@angular/cdk/portal';
import {A11yModule} from '@angular/cdk/a11y';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NDWU_SIZE} from '../../../../shared.types';
import {NdwuIconButtonComponent} from '../../button/icon-button/ndwu-icon-button.component';
import {NdwuButtonComponent} from '../../button/button/ndwu-button.component';
import {NdwuScrollbarComponent} from '../../scrollbar/ndwu-scrollbar.component';
import {NdwuSpokesLoaderComponent} from '../../spokes-loader/ndwu-spokes-loader.component';
import {NdwuModalContainerBaseDirective} from '../base';
import {NdwuModalActionsDirective} from '../directives/ndwu-modal-actions.directive';

@Component({
  selector: 'ndwu-drawer-container',
  templateUrl: './ndwu-drawer-container.component.html',
  styleUrls: [
    './ndwu-drawer-container.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    A11yModule,
    CdkPortalOutlet,
    NdwuLocalizePipe,
    NdwuButtonComponent,
    NdwuIconButtonComponent,
    NdwuModalActionsDirective,
    NdwuScrollbarComponent,
    NdwuSpokesLoaderComponent,
    NgTemplateOutlet,
  ],
})
export class NdwuDrawerContainerComponent extends NdwuModalContainerBaseDirective {
  public static readonly isNdwuDrawerContainer = true;

  protected readonly isXxl = this.config.size === NDWU_SIZE.XXL;
}

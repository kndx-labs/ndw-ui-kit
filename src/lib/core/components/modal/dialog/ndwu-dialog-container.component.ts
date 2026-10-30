import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {CdkPortalOutlet} from '@angular/cdk/portal';
import {A11yModule} from '@angular/cdk/a11y';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NdwuIconButtonComponent} from '../../button/icon-button/ndwu-icon-button.component';
import {NdwuButtonComponent} from '../../button/button/ndwu-button.component';
import {NdwuScrollbarComponent} from '../../scrollbar/ndwu-scrollbar.component';
import {NdwuSpokesLoaderComponent} from '../../spokes-loader/ndwu-spokes-loader.component';
import {NdwuModalContainerBaseDirective} from '../base';
import {NdwuModalActionsDirective} from '../directives/ndwu-modal-actions.directive';

@Component({
  selector: 'ndwu-dialog-container',
  templateUrl: './ndwu-dialog-container.component.html',
  styleUrls: [
    './ndwu-dialog-container.component.scss',
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
export class NdwuDialogContainerComponent extends NdwuModalContainerBaseDirective {
  public static readonly isNdwuDialogContainer = true;
}

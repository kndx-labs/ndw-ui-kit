import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NdwuRouterLoaderComponent} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-router-loader-overview',
  templateUrl: './router-loader-overview.component.html',
  styleUrl: './router-loader-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuRouterLoaderComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class RouterLoaderOverviewComponent {}

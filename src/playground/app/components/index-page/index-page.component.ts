import {ChangeDetectionStrategy, Component, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import libPackage from '../../../../lib/package.json';
import {COMPONENTS_LIST, READY_FOR_REVIEW_COMPONENTS, WIDGETS_LIST} from '../../app.constants';
import type {ComponentName, WidgetName} from '../../app.types';
import {LogoComponent} from '../logo/logo.component';

const LIB_INFO = {
  name: 'NDW UI Kit',
  version: libPackage.version,
};

const INDEX_COMPONENTS: ComponentName[] = COMPONENTS_LIST
  .filter((name) => name !== 'ndwu-context-menu');

@Component({
  selector: 'app-index-page',
  templateUrl: './index-page.component.html',
  styleUrl: './index-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LocalizePipe, LogoComponent, RouterModule],
})
export class IndexPageComponent {
  public readonly LIB_INFO = LIB_INFO;
  public readonly COMPONENTS = INDEX_COMPONENTS;
  public readonly WIDGETS = WIDGETS_LIST;
  public readonly componentSelected = output<ComponentName>();
  public readonly widgetSelected = output<WidgetName>();

  public isReadyForReview(component: ComponentName | WidgetName): boolean {
    return READY_FOR_REVIEW_COMPONENTS.includes(component);
  }

  public select(component: ComponentName): void {
    this.componentSelected.emit(component);
  }

  public selectWidget(widget: WidgetName): void {
    this.widgetSelected.emit(widget);
  }
}

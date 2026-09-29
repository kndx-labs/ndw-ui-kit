import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import type {WidgetName} from '@app/app.types';
import {WIDGET_COMPONENTS} from './widget-registry';

@Component({
  selector: 'app-widget-showcase',
  templateUrl: './widget-showcase.component.html',
  styleUrl: './widget-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class WidgetShowcaseComponent {
  public readonly widget = input.required<WidgetName>();

  protected readonly showcaseType = computed(() => WIDGET_COMPONENTS[this.widget()]);
}

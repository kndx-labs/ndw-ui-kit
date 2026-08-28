import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ComponentName} from '@app/app.types';
import {SHOWCASE_COMPONENTS} from './showcase-registry';

@Component({
  selector: 'app-component-showcase',
  templateUrl: './component-showcase.component.html',
  styleUrl: './component-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ComponentShowcaseComponent {
  public readonly component = input.required<ComponentName>();

  protected readonly showcaseType = computed(() => SHOWCASE_COMPONENTS[this.component()]);
}

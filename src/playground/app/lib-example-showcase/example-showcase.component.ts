import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import type {ExampleName} from '@app/app.types';
import {EXAMPLE_COMPONENTS} from './example-registry';

@Component({
  selector: 'app-example-showcase',
  templateUrl: './example-showcase.component.html',
  styleUrl: './example-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ExampleShowcaseComponent {
  public readonly example = input.required<ExampleName>();

  protected readonly showcaseType = computed(() => EXAMPLE_COMPONENTS[this.example()]);
}

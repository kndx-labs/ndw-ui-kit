import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {
  ROUTER_LOADER_DURATION_FALLBACK,
  ROUTER_LOADER_GEOMETRY,
  coerceRouterLoaderDuration,
} from './ndwu-router-loader.helpers';
import {NdwuRouterLoaderSize} from './ndwu-router-loader.types';

@Component({
  selector: 'ndwu-router-loader',
  templateUrl: './ndwu-router-loader.component.html',
  styleUrl: './ndwu-router-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LocalizePipe],
})
export class NdwuRouterLoaderComponent {
  public readonly size = input<NdwuRouterLoaderSize>('XL');
  public readonly firstColor = input<string>('');
  public readonly secondColor = input<string>('');
  public readonly duration = input(ROUTER_LOADER_DURATION_FALLBACK, {transform: coerceRouterLoaderDuration}); // ms, one full cycle
  public readonly ariaLabel = input<string>('Loading'); // empty string hides the loader from assistive tech

  protected readonly geometry = computed(() => ROUTER_LOADER_GEOMETRY[this.size()]);

  // Empty inputs fall back to the theme tokens (see the component SCSS)
  protected readonly svgStyle = computed(() => {
    return {
      '--router-loader-first-color': this.firstColor() || null,
      '--router-loader-second-color': this.secondColor() || null,
      '--router-loader-duration': `${this.duration()}ms`,
    };
  });
}

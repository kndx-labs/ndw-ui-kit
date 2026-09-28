import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {
  ROUTER_LOADER_GEOMETRY,
  ROUTER_LOADER_SIZE_FALLBACK,
  coerceRouterLoaderSize,
} from './ndwu-router-loader.helpers';

@Component({
  selector: 'ndwu-router-loader',
  templateUrl: './ndwu-router-loader.component.html',
  styleUrl: './ndwu-router-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LocalizePipe],
})
export class NdwuRouterLoaderComponent {
  public readonly size = input(ROUTER_LOADER_SIZE_FALLBACK, {transform: coerceRouterLoaderSize});
  public readonly firstColor = input<string>('');
  public readonly secondColor = input<string>('');
  public readonly ariaLabel = input<string>('Loading');

  protected readonly geometry = computed(() => ROUTER_LOADER_GEOMETRY[this.size()]);

  protected readonly viewBox = computed(() => {
    const size = this.geometry().size;

    return `0 0 ${size} ${size}`;
  });

  // Empty inputs fall back to the theme tokens (see the component SCSS)
  protected readonly svgStyle = computed(() => {
    return {
      '--router-loader-first-color': this.firstColor() || null,
      '--router-loader-second-color': this.secondColor() || null,
    };
  });
}

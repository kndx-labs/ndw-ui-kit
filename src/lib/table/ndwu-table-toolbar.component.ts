import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {NDWU_SIZE_TOKEN, NdwuSizeDirective} from '@ndw-ui-kit/core';

@Component({
  selector: 'ndwu-table-toolbar',
  exportAs: 'ndwuTableToolbar',
  templateUrl: './ndwu-table-toolbar.component.html',
  styleUrl: './ndwu-table-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  providers: [
    {
      provide: NDWU_SIZE_TOKEN,
      useFactory: (sizeDirective: NdwuSizeDirective) => {
        return () => sizeDirective.effectiveSize();
      },
      deps: [NdwuSizeDirective],
    },
  ],
  host: {
    '[class]': 'rootClass()',
  },
})
export class NdwuTableToolbarComponent {
  // The toolbar holds host controls, so it only passes the size down through
  // `NDWU_SIZE_TOKEN`; the buttons inside size themselves from it.
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  protected readonly rootClass = computed(() =>
    `ndwu-table-toolbar ndwu-table-toolbar--${this.sizeSvc.effectiveSize()}`,
  );
}

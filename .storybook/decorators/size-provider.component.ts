import {ChangeDetectionStrategy, Component, forwardRef, input} from '@angular/core';
import {NDWU_SIZE_TOKEN, NdwuSize} from '@ndw-ui-kit/core';

@Component({
  selector: 'app-sb-size-provider',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: contents',
  },
  providers: [
    {
      provide: NDWU_SIZE_TOKEN,
      useFactory: (host: SbSizeProviderComponent) => {
        return () => host.sbToolbarSize();
      },
      deps: [forwardRef(() => SbSizeProviderComponent)],
    },
  ],
})
export class SbSizeProviderComponent {
  public readonly sbToolbarSize = input.required<NdwuSize>();
}

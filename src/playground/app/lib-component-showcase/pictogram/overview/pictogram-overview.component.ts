import {ChangeDetectionStrategy, Component, Signal, computed, signal} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NdwuSizeFlags} from '@ndw-ui-kit/core/utils';
import {
  NDWU_PICTOGRAM_NAME,
  NDWU_PICTOGRAM_VARIANTS,
  NdwuAdaptivePictogramComponent,
  NdwuPictogramComponent,
  NdwuPictogramName,
  NdwuPictogramSize,
  NdwuPictogramVariant,
} from '@ndw-ui-kit/core';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-pictogram-overview',
  templateUrl: './pictogram-overview.component.html',
  styleUrl: './pictogram-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuPictogramComponent, NdwuAdaptivePictogramComponent, LocalizePipe, ShowcaseLayoutComponent],
})
export class PictogramOverviewComponent {
  protected readonly pictogramIsDesktop = signal(true);
  protected readonly pictogramIsMobile: Signal<boolean> = computed(() => !this.pictogramIsDesktop());
  protected readonly pictogramSizeFlags: NdwuSizeFlags<NdwuPictogramSize> = {
    XL: this.pictogramIsDesktop,
    L: this.pictogramIsMobile,
  };

  protected togglePictogramFlags(): void {
    this.pictogramIsDesktop.update((isDesktop) => !isDesktop);
  }

  protected readonly PICTOGRAM_NAME = NDWU_PICTOGRAM_NAME;
  protected readonly PICTOGRAM_VARIANTS = NDWU_PICTOGRAM_VARIANTS;
  protected readonly allVariants: NdwuPictogramVariant[] = Object.keys(
    NDWU_PICTOGRAM_VARIANTS,
  ) as NdwuPictogramVariant[];
  protected readonly variantShowcasePictogram = NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_L;

  protected readonly samplePictograms: NdwuPictogramName[] = [
    NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_L,
    NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_XL,
    NDWU_PICTOGRAM_NAME.PICTOGRAM_CONNECTION2_L,
    NDWU_PICTOGRAM_NAME.PICTOGRAM_INFO3_L,
  ];
}

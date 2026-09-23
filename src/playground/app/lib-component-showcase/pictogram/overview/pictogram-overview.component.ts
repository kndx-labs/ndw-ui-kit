import {ChangeDetectionStrategy, Component, Signal, computed, signal} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NdwuSizeFlags} from '@ndw-ui-kit/core/utils';
import {
  NdwuAdaptivePictogramComponent,
  NdwuPictogramComponent,
  NdwuPictogramName,
  NdwuPictogramSize,
  NdwuPictogramVariant,
  PICTOGRAM_NAME,
  PICTOGRAM_VARIANTS,
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

  protected readonly PICTOGRAM_NAME = PICTOGRAM_NAME;
  protected readonly PICTOGRAM_VARIANTS = PICTOGRAM_VARIANTS;
  protected readonly allVariants: NdwuPictogramVariant[] = Object.keys(PICTOGRAM_VARIANTS) as NdwuPictogramVariant[];
  protected readonly variantShowcasePictogram = PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_L;

  protected readonly samplePictograms: NdwuPictogramName[] = [
    PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_L,
    PICTOGRAM_NAME.PICTOGRAM_CONNECTION1_XL,
    PICTOGRAM_NAME.PICTOGRAM_CONNECTION2_L,
    PICTOGRAM_NAME.PICTOGRAM_INFO3_L,
  ];
}

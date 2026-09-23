import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {BUTTON_VARIANT, ICON_NAME, NdwuButtonComponent, NdwuButtonVariant, NdwuSize, SIZE} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-button-overview',
  templateUrl: './button-overview.component.html',
  styleUrl: './button-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class ButtonOverviewComponent {
  public readonly BUTTON_TYPE = BUTTON_VARIANT;
  public readonly ICON_NAME = ICON_NAME;
  public readonly SIZE = SIZE;

  public readonly TYPES = Object.values(BUTTON_VARIANT);
  public readonly SIZES = Object.values(SIZE);

  public loadingButtonType = signal<NdwuButtonVariant | null>(null);
  public loadingButtonSize = signal<NdwuSize | null>(null);

  public onButtonClick(type: NdwuButtonVariant, size: NdwuSize): void {
    this.loadingButtonType.set(type);
    this.loadingButtonSize.set(size);

    setTimeout(
      () => {
        this.loadingButtonType.set(null);
        this.loadingButtonSize.set(null);
      },
      2000,
    );
  }

  public isLoading(type: NdwuButtonVariant, size: NdwuSize): boolean {
    return this.loadingButtonType() === type && this.loadingButtonSize() === size;
  }
}

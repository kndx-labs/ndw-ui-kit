import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {BUTTON_VARIANT, ButtonVariant, ICON_NAME, NdwuButtonComponent, SIZE, Size} from '@ndw-ui-kit/core';
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

  public loadingButtonType = signal<ButtonVariant | null>(null);
  public loadingButtonSize = signal<Size | null>(null);

  public onButtonClick(type: ButtonVariant, size: Size): void {
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

  public isLoading(type: ButtonVariant, size: Size): boolean {
    return this.loadingButtonType() === type && this.loadingButtonSize() === size;
  }
}

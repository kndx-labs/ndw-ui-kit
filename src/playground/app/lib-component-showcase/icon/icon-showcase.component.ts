import {ChangeDetectionStrategy, Component, Signal, computed, signal} from '@angular/core';
import {ICON_NAME, NdwuAdaptiveIconComponent, NdwuIconComponent, NdwuIconName} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NdwuSizeFlags} from '@ndw-ui-kit/core/utils';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-icon-showcase',
  templateUrl: './icon-showcase.component.html',
  styleUrl: './icon-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuIconComponent,
    NdwuAdaptiveIconComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class IconShowcaseComponent {
  public readonly ICON_NAME = ICON_NAME;

  // Sample icons for demonstration
  public readonly sampleIcons: NdwuIconName[] = [
    ICON_NAME.ADD_L,
    ICON_NAME.CHECK_L,
    ICON_NAME.CLOSE_L,
    ICON_NAME.SEARCH_L,
    ICON_NAME.SETTINGS_L,
    ICON_NAME.EDIT_L,
    ICON_NAME.TRASH_L,
    ICON_NAME.DOWNLOAD_L,
    ICON_NAME.UPLOAD_L,
  ];

  public readonly colorExamples = [
    {name: 'icon-showcase.color-default', class: ''},
    {name: 'icon-showcase.color-primary', class: 'icon-color-primary'},
    {name: 'icon-showcase.color-success', class: 'icon-color-success'},
    {name: 'icon-showcase.color-error', class: 'icon-color-error'},
  ];

  // Configurable example state
  public readonly allIcons: NdwuIconName[] = Object.values(ICON_NAME);
  public readonly selectedIcon = signal<NdwuIconName>(ICON_NAME.ADD_L);
  public readonly selectedColor = signal<string>('#000000');

  public onIconChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.selectedIcon.set(select.value as NdwuIconName);
  }

  public handleArrowKeys(event: KeyboardEvent): void {
    const key = event.key;
    const currentIndex = this.allIcons.indexOf(this.selectedIcon());

    if (key === 'ArrowDown' || key === 'ArrowRight') {
      const nextIndex = (currentIndex + 1) % this.allIcons.length;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.selectedIcon.set(this.allIcons[nextIndex]!);

      event.preventDefault();
    } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
      const prevIndex = (currentIndex - 1 + this.allIcons.length) % this.allIcons.length;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.selectedIcon.set(this.allIcons[prevIndex]!);

      event.preventDefault();
    }
  }

  public onColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.selectedColor.set(input.value);
  }

  // Adaptive icon: `sizeFlags` via a map of Signal<boolean>
  public readonly adaptiveIsDesktop = signal(true);
  public readonly adaptiveIsMobile: Signal<boolean> = computed(() => !this.adaptiveIsDesktop());
  public readonly adaptiveSizeFlags: NdwuSizeFlags = {
    L: this.adaptiveIsDesktop,
    S: this.adaptiveIsMobile,
  };

  public toggleAdaptiveFlags(): void {
    this.adaptiveIsDesktop.update((isDesktop) => !isDesktop);
  }
}

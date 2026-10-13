import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';

export type SandboxTheme = 'light' | 'dark';

const DEFAULT_THEMES: readonly string[] = ['light', 'dark'];

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuLocalizePipe,
  ],
})
export class ThemeSwitcherComponent {
  public readonly theme = input.required<string>();
  public readonly themes = input<readonly string[]>(DEFAULT_THEMES);
  public readonly themeChange = output<string>();

  public getThemeLabelKey(themeId: string): string {
    return `common.themes.${themeId}`;
  }

  public selectTheme(themeId: string): void {
    this.themeChange.emit(themeId);
  }
}

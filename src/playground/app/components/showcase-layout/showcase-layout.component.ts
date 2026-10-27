import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, TemplateRef, contentChild, input, signal} from '@angular/core';
import {NdwuTheme} from '@ndw-ui-kit/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
// noinspection ES6PreferShortImport
import {ThemeSwitcherComponent} from '../theme-switcher/theme-switcher.component';

export interface ShowcaseLayoutContext {
  theme: NdwuTheme;
  idPrefix: string;
}

@Component({
  selector: 'app-showcase-layout',
  templateUrl: './showcase-layout.component.html',
  styleUrl: './showcase-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NdwuLocalizePipe,
    ThemeSwitcherComponent,
  ],
})
export class ShowcaseLayoutComponent {
  public readonly lightTitleKey = input.required<string>();
  public readonly darkTitleKey = input.required<string>();

  public readonly contentTemplate = contentChild<TemplateRef<ShowcaseLayoutContext>>(TemplateRef);

  public readonly mobileTheme = signal<NdwuTheme>('light');

  protected readonly lightContext: ShowcaseLayoutContext = {
    theme: 'light',
    idPrefix: 'light-',
  };

  protected readonly darkContext: ShowcaseLayoutContext = {
    theme: 'dark',
    idPrefix: 'dark-',
  };

  public onMobileThemeChange(theme: string): void {
    this.mobileTheme.set(theme as NdwuTheme);
  }
}

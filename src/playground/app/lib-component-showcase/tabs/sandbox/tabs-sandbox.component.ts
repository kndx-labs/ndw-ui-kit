import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NDWU_SIZE,
  type NdwuSize,
  type NdwuTabItem,
  type NdwuTabVariant,
  type NdwuTabWidthMode,
  NdwuTabsComponent,
  type NdwuTabsScrollMode,
} from '@ndw-ui-kit/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent} from '@app/components';

@Component({
  selector: 'app-tabs-sandbox',
  templateUrl: './tabs-sandbox.component.html',
  styleUrl: './tabs-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuTabsComponent,
    NdwuLocalizePipe,
    ThemeSwitcherComponent,
  ],
})
export class TabsSandboxComponent {
  public readonly SIZE = NDWU_SIZE;

  public readonly sandboxTheme = signal<'light' | 'dark'>('light');

  public readonly sandboxForm = new FormGroup({
    selectedTabId: new FormControl<string>('tab2', {nonNullable: true}),
    size: new FormControl<NdwuSize>(NDWU_SIZE.L, {nonNullable: true}),
    variant: new FormControl<NdwuTabVariant>('default', {nonNullable: true}),
    scrollMode: new FormControl<NdwuTabsScrollMode>('auto', {nonNullable: true}),
    scrollContainerWidth: new FormControl<string>('368px', {nonNullable: true}),
    tabWidthMode: new FormControl<NdwuTabWidthMode>('content', {nonNullable: true}),
  });

  protected readonly defaultTabs: NdwuTabItem[] = [
    {id: 'tab1', label: 'Wi-Fi settings'},
    {id: 'tab2', label: 'Lan configuration'},
    {id: 'tab3', label: 'Port forwarding', disabled: true},
    {id: 'tab4', label: 'Diagnostics'},
    {id: 'tab5', label: 'Security'},
    {id: 'tab6', label: 'Advanced settings'},
  ];

  public readonly tabs = signal<NdwuTabItem[]>([...this.defaultTabs]);

  public readonly tabsJson = signal(JSON.stringify(this.defaultTabs, null, 2));

  public onTabChange(tabId: string): void {
    this.sandboxForm.controls.selectedTabId.setValue(tabId);
  }

  public setSandboxTheme(theme: 'light' | 'dark'): void {
    this.sandboxTheme.set(theme);
  }

  public updateTabsFromJson(json: string): void {
    try {
      const parsed = JSON.parse(json) as NdwuTabItem[];

      this.tabs.set(parsed);
    } catch {
      // Invalid JSON, keep current tabs
    }
  }

  public resetSandbox(): void {
    this.sandboxTheme.set('light');
    this.sandboxForm.reset({
      selectedTabId: 'tab2',
      size: NDWU_SIZE.L,
      variant: 'default',
      scrollMode: 'auto',
      scrollContainerWidth: '368px',
      tabWidthMode: 'content',
    });
    this.tabs.set([...this.defaultTabs]);
    this.tabsJson.set(JSON.stringify(this.defaultTabs, null, 2));
  }
}

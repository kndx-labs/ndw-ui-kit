import {CommonModule, DOCUMENT} from '@angular/common';
import {ChangeDetectionStrategy, Component, DestroyRef, OnInit, effect, inject, signal} from '@angular/core';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs';
import {ICON_NAME, NdwuIconComponent, NdwuModalService, NdwuScrollbarComponent} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {IndexPageComponent, InteractionDebugPanelComponent} from '@app/components';
import {DebugSettingsDialogComponent} from '@app/components/debug-settings-dialog/debug-settings-dialog.component';
import {NdwuSearchComponent, SearchItem} from '@app/components/search/ndwu-search.component';
import {PlaygroundDebugService} from '@app/services/playground-debug.service';
import {ComponentShowcaseComponent} from './lib-component-showcase/component-showcase.component';
import {ExampleShowcaseComponent} from './lib-example-showcase/example-showcase.component';
import type {ComponentName, ExampleName} from './app.types';
import {
  COMPONENTS_LIST,
  COMPONENT_TABS,
  EXAMPLES_LIST,
  EXAMPLE_NAMES,
  MENU_ITEMS,
  READY_FOR_REVIEW_COMPONENTS,
  SHOWCASE_NAMES,
} from './app.constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ComponentShowcaseComponent,
    ExampleShowcaseComponent,
    IndexPageComponent,
    InteractionDebugPanelComponent,
    LocalizePipe,
    NdwuIconComponent,
    NdwuScrollbarComponent,
    RouterModule,
  ],
})
export class AppComponent implements OnInit {
  public readonly MENU_ITEMS = MENU_ITEMS;
  public readonly SHOWCASE_NAMES = SHOWCASE_NAMES;
  public readonly COMPONENTS_LIST = COMPONENTS_LIST;
  public readonly EXAMPLES_LIST = EXAMPLES_LIST;
  public readonly EXAMPLE_NAMES = EXAMPLE_NAMES;

  // TranslateService is optional - only available when using ngx-translate config
  private readonly translate = inject(TranslateService, {optional: true});
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly modalService = inject(NdwuModalService);
  private readonly document = inject(DOCUMENT);
  public readonly debugService = inject(PlaygroundDebugService);

  public readonly currentLang = signal<string>('en');
  public readonly isMobileMenuOpen = signal<boolean>(false);
  public readonly isSidebarCollapsed = signal<boolean>(false);
  public readonly ICON_NAME = ICON_NAME;

  public readonly selectedComponent = signal<ComponentName | null>(null);
  public readonly selectedExample = signal<ExampleName | null>(null);
  public readonly expandedGroups = signal<Set<string>>(new Set());

  protected readonly isDebugDialogOpen = signal<boolean>(false);

  public isReadyForReview(component: ComponentName): boolean {
    return READY_FOR_REVIEW_COMPONENTS.includes(component);
  }

  public isGroupExpanded(label: string): boolean {
    return this.expandedGroups().has(label);
  }

  public toggleGroup(label: string): void {
    this.expandedGroups.update((set) => {
      const next = new Set(set);

      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }

      return next;
    });
  }

  constructor() {
    this.syncSelectedFromUrl();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.syncSelectedFromUrl();
      });

    const handleKeydown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        this.openSearch();

        return;
      }

      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement;

        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.isContentEditable !== true) {
          event.preventDefault();
          this.openSearch();

          return;
        }
      }

      if (event.ctrlKey && (event.key === 'm' || event.key === 'M')) {
        event.preventDefault();
        this.openDebugSettingsDialog();

        return;
      }
    };

    this.document.addEventListener('keydown', handleKeydown);

    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('keydown', handleKeydown);
    });

    effect(() => {
      const showTapAreas = this.debugService.showTapAreas();

      if (showTapAreas) {
        this.document.body.classList.add('ndwu-debug-tap-areas');
      } else {
        this.document.body.classList.remove('ndwu-debug-tap-areas');
      }
    });
  }

  public ngOnInit(): void {
    if (this.translate) {
      const lang = this.translate.getCurrentLang() || 'en';

      this.currentLang.set(lang);

      this.translate.onLangChange
        .pipe(
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((event) => {
          this.currentLang.set(event.lang);
        });
    }
  }

  private syncSelectedFromUrl(): void {
    const url = this.router.url;

    // Root/index page - nothing selected
    if (url === '/' || url === '') {
      this.selectedExample.set(null);
      this.selectedComponent.set(null);

      return;
    }

    const exampleMatch = url.match(/\/example\/([^/]+)/);
    const exampleName = exampleMatch?.[1] as ExampleName | undefined;

    if (exampleName && EXAMPLES_LIST.includes(exampleName)) {
      this.selectedExample.set(exampleName);

      return;
    }

    this.selectedExample.set(null);

    const match = url.match(/\/component\/([^/]+)/);
    const componentName = (match?.[1] as ComponentName) ?? null;

    if (componentName && COMPONENTS_LIST.includes(componentName)) {
      this.selectedComponent.set(componentName);
      this.expandGroupContaining(componentName);
    } else if (componentName && !COMPONENTS_LIST.includes(componentName)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const fallback = COMPONENTS_LIST[0]!;
      const fallbackTab = COMPONENT_TABS[fallback][0];

      void this.router.navigate(
        ['/component', fallback, fallbackTab],
        {
          replaceUrl: true,
        },
      );
    }
  }

  public selectExample(example: ExampleName): void {
    this.selectedExample.set(example);
    this.isMobileMenuOpen.set(false);
    void this.router.navigate(['/example', example]);
  }

  public selectComponent(component: ComponentName): void {
    // Update signal immediately for instant feedback
    this.selectedComponent.set(component);

    // Close mobile menu when component is selected
    this.isMobileMenuOpen.set(false);

    // Then navigate to update URL
    const firstTab = COMPONENT_TABS[component][0];

    void this.router.navigate(['/component', component, firstTab]);
  }

  public toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  public closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  public toggleSidebarCollapse(): void {
    this.isSidebarCollapsed.update((collapsed) => !collapsed);
  }

  private expandGroupContaining(componentName: ComponentName): void {
    for (const item of MENU_ITEMS) {
      if (item.type === 'group' && item.children.includes(componentName)) {
        this.expandedGroups.update((set) => {
          const next = new Set(set);

          next.add(item.label);

          return next;
        });
        break;
      }
    }
  }

  public switchLanguage(lang: string): void {
    if (this.translate) {
      this.translate.use(lang).subscribe();
    } else {
      // If translate service is not available, update signal directly
      this.currentLang.set(lang);
    }
  }

  public openSearch(): void {
    const searchData = this.buildSearchData();
    const modalRef = this.modalService.open('dialog', NdwuSearchComponent, {
      hasCloseButton: false,
      trapFocus: true,
      autoFocus: false,
      width: '640px',
      maxWidth: '90vw',
      data: {
        searchData,
        categories: [
          {type: 'component', label: 'Components'},
          {type: 'example', label: 'Examples'},
        ],
        placeholder: 'Search components...',
      },
    });

    modalRef.afterClosed$
      .subscribe((result: unknown) => {
        const searchResult = result as SearchItem | undefined;

        if (searchResult?.route) {
          void this.router.navigate(searchResult.route);
        }
      });
  }

  private buildSearchData() {
    const componentItems = COMPONENTS_LIST.map((name) => ({
      id: name,
      type: 'component' as const,
      label: SHOWCASE_NAMES[name] ?? name,
      description: `Component showcase: ${name}`,
      route: ['/component', name, COMPONENT_TABS[name][0] ?? 'overview'],
    }));

    const exampleItems = EXAMPLES_LIST.map((name) => ({
      id: name,
      type: 'example' as const,
      label: EXAMPLE_NAMES[name] ?? name,
      description: `Example: ${name}`,
      route: ['/example', name],
    }));

    return [...componentItems, ...exampleItems];
  }

  public openDebugSettingsDialog(): void {
    if (this.isDebugDialogOpen()) {
      return;
    }

    const modalRef = this.modalService.openDialog(
      DebugSettingsDialogComponent,
      {
        title: 'Debug Settings',
        width: '400px',
      },
    );

    this.isDebugDialogOpen.set(true);

    modalRef.afterClosed$
      .subscribe(() => {
        this.isDebugDialogOpen.set(false);
      });
  }
}

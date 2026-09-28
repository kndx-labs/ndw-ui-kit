import {ChangeDetectionStrategy, Component, DestroyRef, OnInit, type Type, inject, input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs';
// noinspection ES6PreferShortImport
import {type Tab, TabsComponent} from '../tabs/tabs.component';

@Component({
  selector: 'app-showcase-tabs-shell',
  templateUrl: './showcase-tabs-shell.component.html',
  styleUrl: './showcase-tabs-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TabsComponent,
  ],
})
export class ShowcaseTabsShellComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly router = inject(Router);

  public readonly routePrefix = input<string>('component');
  public readonly routeBase = input.required<string>();
  public readonly tabs = input.required<readonly Tab[]>();
  public readonly defaultTabId = input.required<string>();
  public readonly tabContentMap = input.required<Record<string, Type<unknown>>>();

  protected readonly activeTab = signal<string>('overview');

  protected readonly currentContentType = signal<Type<unknown> | null>(null);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.syncTabFromUrl();
      });
  }

  public ngOnInit(): void {
    this.syncTabFromUrl();
  }

  protected setTab(tab: string): void {
    this.activeTab.set(tab);
    this.currentContentType.set(this.tabContentMap()[tab] ?? null);

    void this.router.navigate(
      ['/', this.routePrefix(), this.routeBase(), tab],
      {
        queryParamsHandling: 'preserve',
        preserveFragment: true,
      },
    );
  }

  protected syncTabFromUrl(): void {
    const urlTree = this.router.parseUrl(this.router.url);
    const segments = urlTree.root.children['primary']?.segments ?? [];
    const lastSegment = segments.at(-1)?.path;
    const tabIds = this.tabs().map((t) => t.id);

    if (!!lastSegment && tabIds.includes(lastSegment)) {
      this.activeTab.set(lastSegment);
      this.currentContentType.set(this.tabContentMap()[lastSegment] ?? null);

      return;
    }

    const defaultId = this.defaultTabId();

    this.activeTab.set(defaultId);
    this.currentContentType.set(this.tabContentMap()[defaultId] ?? null);
  }
}

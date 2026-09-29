import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  NDWU_ICON_NAME,
  NDWU_MODAL_DATA,
  NDWU_MODAL_REF,
  NdwuIconComponent,
  NdwuModalRef,
  NdwuScrollbarComponent,
} from '@ndw-ui-kit/core';
import {NdwuInputFieldComponent} from '@ndw-ui-kit/core/form-field';

export type SearchContentType = 'component' | 'widget' | 'example';

export interface SearchItem {
  id: string;
  type: SearchContentType;
  label: string;
  description: string;
  route: string[];
  icon?: string;
}

export interface SearchCategory {
  type: SearchContentType;
  label: string;
}

export interface SearchResult extends SearchItem {
  highlightedLabel: string;
  highlightedDescription: string;
}

export interface SearchResultGroup {
  category: SearchCategory;
  results: SearchResult[];
}

export interface SearchModalData {
  searchData: SearchItem[];
  categories: SearchCategory[];
  placeholder?: string;
}

@Component({
  selector: 'ndwu-search',
  templateUrl: './ndwu-search.component.html',
  styleUrl: './ndwu-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    NdwuIconComponent,
    NdwuScrollbarComponent,
    NdwuInputFieldComponent,
  ],
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class NdwuSearchComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;

  private readonly modalData = inject<SearchModalData>(NDWU_MODAL_DATA);
  private readonly modalRef = inject(NDWU_MODAL_REF, {optional: true}) as NdwuModalRef<SearchItem> | null;

  protected readonly searchData = computed(() => this.modalData.searchData ?? []);
  protected readonly categories = computed(() => this.modalData.categories ?? []);
  protected readonly placeholder = computed(() => this.modalData.placeholder ?? 'Search...');

  protected readonly query = signal<string>('');
  protected readonly searchInput = viewChild.required<NdwuInputFieldComponent>('searchInput');
  protected readonly resultContainer = viewChild.required<ElementRef<HTMLElement>>('resultContainer');

  protected readonly resultGroups = computed<SearchResultGroup[]>(() => {
    return this.filterSearchResults(this.query(), this.searchData(), this.categories());
  });

  protected readonly flatResults = computed<SearchResult[]>(() => {
    return this.resultGroups().flatMap((g) => g.results);
  });

  protected readonly bestMatch = computed<SearchItem | null>(() => {
    return this.findBestMatch(this.query(), this.searchData());
  });

  protected readonly activeIndex = signal<number>(-1);
  protected readonly activeResultId = computed<string | null>(() => {
    return this.flatResults()[this.activeIndex()]?.id ?? null;
  });
  protected readonly totalResults = computed(() => this.flatResults().length);

  constructor() {
    afterNextRender(() => {
      this.searchInput().setFocus();
    });
  }

  protected onQueryChange(value: string): void {
    this.query.set(value);
    this.activeIndex.set(-1);
  }

  protected selectResult(result: SearchItem): void {
    this.modalRef?.close(result);
  }

  protected clearQuery(): void {
    this.query.set('');
    this.activeIndex.set(-1);
    this.searchInput().setFocus();
  }

  protected isActive(result: SearchItem): boolean {
    return result.id === this.activeResultId();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.modalRef?.close();

      return;
    }

    const total = this.totalResults();

    if (total === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((i) => (i + 1) % total);
      this.scrollActiveIntoView();

      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((i) => (i - 1 + total) % total);
      this.scrollActiveIntoView();

      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      const active = this.activeIndex();
      const result = this.flatResults()[active >= 0 ? active : 0];

      if (result) {
        this.selectResult(result);
      }
    }
  }

  private scrollActiveIntoView(): void {
    const container = this.resultContainer()?.nativeElement;

    if (!container) {
      return;
    }

    const activeEl = container.querySelector('[data-active="true"]');

    if (activeEl) {
      activeEl.scrollIntoView({block: 'nearest'});
    }
  }

  private filterSearchResults(
    query: string,
    items: SearchItem[],
    categories: SearchCategory[],
  ): SearchResultGroup[] {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return [];
    }

    const matched = items.filter((item) => item.label.toLowerCase().includes(normalizedQuery));

    return categories
      .map((category) => {
        const categoryItems = matched.filter((item) => item.type === category.type);

        if (categoryItems.length === 0) {
          return null;
        }

        return {
          category,
          results: categoryItems.map((item) => ({
            ...item,
            highlightedLabel: this.highlightMatches(item.label, normalizedQuery),
            highlightedDescription: this.highlightMatches(item.description, normalizedQuery),
          })),
        };
      })
      .filter((group): group is SearchResultGroup => group !== null);
  }

  private highlightMatches(text: string, query: string): string {
    if (!query) {
      return text;
    }

    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(query);

    if (index === -1) {
      return text;
    }

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return `${before}<mark>${match}</mark>${after}`;
  }

  private findBestMatch(query: string, items: SearchItem[]): SearchItem | null {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return null;
    }

    return (
      items.find((item) => item.label.toLowerCase() === normalizedQuery)
        ?? items.find((item) => item.label.toLowerCase().startsWith(normalizedQuery))
        ?? items.find((item) => item.label.toLowerCase().includes(normalizedQuery))
        ?? null
    );
  }
}

import {ChangeDetectionStrategy, Component, computed, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  NDWU_ICON_NAME,
  NDWU_ICON_NAMES,
  NdwuCheckboxComponent,
  NdwuIconComponent,
  NdwuIconName,
} from '@ndw-ui-kit/core';
import {NdwuInputFieldComponent} from '@ndw-ui-kit/core/form-field';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent} from '@app/components';

interface IconRegistryEntry {
  name: NdwuIconName;
  size: string;
}

interface IconRegistrySize {
  size: string;
  label: string;
}

const KNOWN_SIZE_ORDER: readonly string[] = ['XS', 'S', 'L', 'XL'];

const getIconSize = (name: string): string => {
  return name.match(/_([A-Z]+)$/)?.[1] ?? '';
};

const getSizeRank = (size: string): number => {
  const index = KNOWN_SIZE_ORDER.indexOf(size);

  return index === -1 ? KNOWN_SIZE_ORDER.length : index;
};

const compareSizes = (a: string, b: string): number => {
  return getSizeRank(a) - getSizeRank(b) || a.localeCompare(b);
};

const buildSizes = (entries: readonly IconRegistryEntry[]): IconRegistrySize[] => {
  const totals = new Map<string, number>();

  for (const {size} of entries) {
    totals.set(size, (totals.get(size) ?? 0) + 1);
  }

  return [...totals.keys()]
    .sort(compareSizes)
    .map((size) => ({size, label: `${size} (${totals.get(size)})`}));
};

@Component({
  selector: 'app-icon-registry',
  templateUrl: './icon-registry.component.html',
  styleUrl: './icon-registry.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    NdwuCheckboxComponent,
    NdwuIconComponent,
    NdwuInputFieldComponent,
    NdwuLocalizePipe,
    ThemeSwitcherComponent,
  ],
})
export class IconRegistryComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;

  protected readonly entries: readonly IconRegistryEntry[] = NDWU_ICON_NAMES.map((name) => ({
    name,
    size: getIconSize(name),
  }));

  protected readonly sizes: readonly IconRegistrySize[] = buildSizes(this.entries);

  protected readonly query = signal('');
  protected readonly selectedSizes = signal<ReadonlySet<string>>(new Set(this.sizes.map(({size}) => size)));
  protected readonly theme = signal<string>('light');

  protected readonly trimmedQuery = computed(() => this.query().trim());

  protected readonly visibleIcons = computed(() => {
    const query = this.trimmedQuery().toLowerCase();
    const selectedSizes = this.selectedSizes();

    return this.entries.filter(({name, size}) => selectedSizes.has(size) && name.toLowerCase().includes(query));
  });

  protected toggleSize(size: string, checked: boolean): void {
    this.selectedSizes.update((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(size);
      } else {
        next.delete(size);
      }

      return next;
    });
  }

  protected clearQuery(): void {
    this.query.set('');
  }
}

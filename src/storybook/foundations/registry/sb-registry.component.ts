import {ChangeDetectionStrategy, Component, computed, input, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  NDWU_ICON_NAME,
  NDWU_ICON_NAMES,
  NDWU_PICTOGRAM_NAME,
  NdwuCheckboxComponent,
  NdwuIconComponent,
  NdwuPictogramComponent,
} from '@ndw-ui-kit/core';
import {NdwuInputFieldComponent} from '@ndw-ui-kit/core/form-field';

export type SbRegistryKind = 'icon' | 'pictogram';

interface SbRegistrySource {
  names: readonly string[];
  noun: string;
}

interface SbRegistryEntry {
  name: string;
  size: string;
}

interface SbRegistrySize {
  size: string;
  label: string;
}

const REGISTRY_SOURCES: Record<SbRegistryKind, SbRegistrySource> = {
  icon: {names: NDWU_ICON_NAMES, noun: 'icons'},
  pictogram: {names: Object.values(NDWU_PICTOGRAM_NAME), noun: 'pictograms'},
};

const KNOWN_SIZE_ORDER: readonly string[] = ['XS', 'S', 'L', 'XL'];

const getSize = (name: string): string => {
  return name.match(/_([A-Z]+)$/)?.[1] ?? '';
};

const getSizeRank = (size: string): number => {
  const index = KNOWN_SIZE_ORDER.indexOf(size);

  return index === -1 ? KNOWN_SIZE_ORDER.length : index;
};

const compareSizes = (a: string, b: string): number => {
  return getSizeRank(a) - getSizeRank(b) || a.localeCompare(b);
};

const buildEntries = (names: readonly string[]): readonly SbRegistryEntry[] => {
  return names.map((name) => ({name, size: getSize(name)}));
};

const buildSizes = (entries: readonly SbRegistryEntry[]): readonly SbRegistrySize[] => {
  const totals = new Map<string, number>();

  for (const {size} of entries) {
    totals.set(size, (totals.get(size) ?? 0) + 1);
  }

  return [...totals.keys()]
    .sort(compareSizes)
    .map((size) => ({size, label: `${size} (${totals.get(size)})`}));
};

@Component({
  selector: 'sb-registry',
  templateUrl: './sb-registry.component.html',
  styleUrl: './sb-registry.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    NdwuCheckboxComponent,
    NdwuIconComponent,
    NdwuInputFieldComponent,
    NdwuPictogramComponent,
  ],
})
export class SbRegistryComponent {
  public readonly kind = input.required<SbRegistryKind>();

  protected readonly ICON_NAME = NDWU_ICON_NAME;

  protected readonly source = computed(() => REGISTRY_SOURCES[this.kind()]);
  protected readonly entries = computed(() => buildEntries(this.source().names));
  protected readonly sizes = computed(() => buildSizes(this.entries()));

  protected readonly query = signal('');
  protected readonly hiddenSizes = signal<ReadonlySet<string>>(new Set());

  protected readonly trimmedQuery = computed(() => this.query().trim());

  protected readonly noSizes = computed(() => {
    const hiddenSizes = this.hiddenSizes();

    return this.sizes().every(({size}) => hiddenSizes.has(size));
  });

  protected readonly visibleEntries = computed(() => {
    const query = this.trimmedQuery().toLowerCase();
    const hiddenSizes = this.hiddenSizes();

    return this.entries().filter(({name, size}) => !hiddenSizes.has(size) && name.toLowerCase().includes(query));
  });

  protected toggleSize(size: string, checked: boolean): void {
    this.hiddenSizes.update((current) => {
      const next = new Set(current);

      if (checked) {
        next.delete(size);
      } else {
        next.add(size);
      }

      return next;
    });
  }

  protected clearQuery(): void {
    this.query.set('');
  }
}

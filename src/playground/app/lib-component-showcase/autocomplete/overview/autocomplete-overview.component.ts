import {ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {debounceTime} from 'rxjs';
import {
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuAutocompleteComponent,
  type NdwuAutocompleteOption,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  NdwuHintDirective,
  NdwuIconComponent,
  type NdwuIconName,
  NdwuLinkComponent,
  NdwuOptionTemplateDirective,
} from '@ndw-ui-kit/core';
import {
  NdwuAutocompleteFieldComponent,
  NdwuAutocompleteFooterDirective,
  NdwuHelperMessageComponent,
  NdwuValidators,
} from '@ndw-ui-kit/core/form-field';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';
import {
  AUTOCOMPLETE_CITIES,
  AUTOCOMPLETE_GROUPS,
  AUTOCOMPLETE_OPTIONS,
  knowledgeBaseSearchUrl,
} from '../autocomplete-showcase.data';

@Component({
  selector: 'app-autocomplete-overview',
  templateUrl: './autocomplete-overview.component.html',
  styleUrl: './autocomplete-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuLocalizePipe,
    NdwuIconComponent,
    NdwuOptionTemplateDirective,
    NdwuAutocompleteComponent,
    NdwuAutocompleteFieldComponent,
    NdwuAutocompleteFooterDirective,
    NdwuFloatingLabelComponent,
    NdwuFormFieldComponent,
    NdwuHelperMessageComponent,
    NdwuHintDirective,
    NdwuLinkComponent,
    ShowcaseLayoutComponent,
  ],
})
export class AutocompleteOverviewComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public readonly SIZE = NDWU_SIZE;
  public readonly cities = AUTOCOMPLETE_CITIES;
  public readonly options = AUTOCOMPLETE_OPTIONS;
  public readonly customOptions: readonly (NdwuAutocompleteOption & {icon: NdwuIconName})[] = [
    {value: 'de', label: 'Germany', icon: NDWU_ICON_NAME.ROUTER_S},
    {value: 'fr', label: 'France', icon: NDWU_ICON_NAME.WARNING_S, variant: 'danger'},
    {value: 'it', label: 'Italy', icon: NDWU_ICON_NAME.INFO_S},
    {value: 'nl', label: 'Netherlands', icon: NDWU_ICON_NAME.ROUTER_S},
    {value: 'dk', label: 'Denmark', icon: NDWU_ICON_NAME.INFO_S},
    {value: 'jp', label: 'Japan', icon: NDWU_ICON_NAME.WARNING_S},
  ];
  public readonly groups = AUTOCOMPLETE_GROUPS;
  public readonly knowledgeBaseSearchUrl = knowledgeBaseSearchUrl;

  public readonly compoundValue = signal<string>('');
  public readonly lastSelected = signal<NdwuAutocompleteOption | null>(null);
  public readonly serverOptions = signal<readonly NdwuAutocompleteOption[]>([]);

  public readonly searchForm = new FormGroup({
    query: new FormControl('', {nonNullable: true}),
  });

  public readonly sizesForm = new FormGroup({
    xxl: new FormControl('', {nonNullable: true}),
    xl: new FormControl('', {nonNullable: true}),
    l: new FormControl('', {nonNullable: true}),
  });

  public readonly invalidForm = new FormGroup({
    city: new FormControl('', {nonNullable: true, validators: [NdwuValidators.required()]}),
  });

  public readonly disabledForm = new FormGroup({
    city: new FormControl({value: 'Berlin', disabled: true}, {nonNullable: true}),
  });

  public readonly readonlyForm = new FormGroup({
    city: new FormControl('Berlin', {nonNullable: true}),
  });

  public readonly serverForm = new FormGroup({
    city: new FormControl('', {nonNullable: true}),
  });

  public readonly bottomForm = new FormGroup({
    query: new FormControl('', {nonNullable: true}),
  });

  public ngOnInit(): void {
    this.invalidForm.controls.city.markAsTouched();

    this.serverForm.controls.city.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => this.serverOptions.set(this.searchCities(query)));
  }

  private searchCities(query: string): readonly NdwuAutocompleteOption[] {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    return this.cities.filter((city) => city.label.toLowerCase().startsWith(normalized));
  }

  protected splitMatch(label: string, query?: string): {before: string; match: string; after: string} {
    const trimmedQuery = query?.trim() ?? '';
    const matchIndex = label.toLocaleLowerCase().indexOf(trimmedQuery.toLocaleLowerCase());

    if (!trimmedQuery || matchIndex < 0) {
      return {before: label, match: '', after: ''};
    }

    const matchEnd = matchIndex + trimmedQuery.length;

    return {
      before: label.slice(0, matchIndex),
      match: label.slice(matchIndex, matchEnd),
      after: label.slice(matchEnd),
    };
  }
}

import {ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {debounceTime} from 'rxjs';
import {
  NDWU_SIZE,
  NdwuAutocompleteComponent,
  NdwuAutocompleteFooterDirective,
  type NdwuAutocompleteOption,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  NdwuHintDirective,
  NdwuLinkComponent,
} from '@ndw-ui-kit/core';
import {NdwuAutocompleteFieldComponent, NdwuHelperMessageComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';
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

  public onSelected(option: NdwuAutocompleteOption): void {
    this.lastSelected.set(option);
  }

  private searchCities(query: string): readonly NdwuAutocompleteOption[] {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    return this.cities.filter((city) => city.label.toLowerCase().startsWith(normalized));
  }
}

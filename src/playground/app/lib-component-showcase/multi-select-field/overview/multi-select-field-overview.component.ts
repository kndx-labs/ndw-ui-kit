import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NdwuOptionGroup, SIZE} from '@ndw-ui-kit/core';
import {NdwuMultiSelectDisplayDirective, NdwuMultiSelectFieldComponent} from '@ndw-ui-kit/core/form-field';
import {ShowcaseLayoutComponent} from '@app/components';
import {
  CONTINENT_GROUPS,
  COUNTRY_OPTIONS,
  COUNTRY_OPTIONS_GROUPED,
  COUNTRY_OPTIONS_LONG_LIST,
  USER_PROVIDED_LABEL_OPTIONS,
} from '../../shared/select-showcase.data';

@Component({
  selector: 'app-multi-select-field-overview',
  templateUrl: './multi-select-field-overview.component.html',
  styleUrl: './multi-select-field-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuMultiSelectDisplayDirective,
    NdwuMultiSelectFieldComponent,
    ShowcaseLayoutComponent,
  ],
})
export class MultiSelectFieldOverviewComponent {
  public readonly SIZES = Object.values(SIZE).filter((size) => size !== SIZE.S);

  protected readonly countryOptions = COUNTRY_OPTIONS;
  protected readonly countryOptionsLongList = COUNTRY_OPTIONS_LONG_LIST;
  protected readonly userProvidedLabelOptions = USER_PROVIDED_LABEL_OPTIONS;
  protected readonly countryOptionsGrouped = COUNTRY_OPTIONS_GROUPED;
  protected readonly continentGroups: NdwuOptionGroup[] = CONTINENT_GROUPS;

  protected readonly formBasic = new FormGroup({
    countries: new FormControl<string[]>([]),
  });

  protected readonly formDisabled = new FormGroup({
    countries: new FormControl({value: ['de', 'ch'] as string[], disabled: true}),
  });

  protected readonly formRequired = new FormGroup({
    countries: new FormControl<string[]>([], Validators.required),
  });

  protected readonly formCustomDisplay = new FormGroup({
    countries: new FormControl<string[]>([]),
  });

  protected readonly formNoLocalize = new FormGroup({
    tags: new FormControl<string[]>([]),
  });

  protected readonly formGrouped = new FormGroup({
    countries: new FormControl<string[]>([]),
  });

  protected readonly formSizes = new FormGroup({
    countriesL: new FormControl<string[]>([]),
    countriesXL: new FormControl<string[]>([]),
    countriesXXL: new FormControl<string[]>([]),
  });
}

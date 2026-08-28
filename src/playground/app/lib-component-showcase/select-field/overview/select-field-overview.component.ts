import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NdwuOption, SIZE} from '@ndw-ui-kit/core';
import {NdwuSelectFieldComponent} from '@ndw-ui-kit/core/form-field';
import {ShowcaseLayoutComponent} from '@app/components';
import {COUNTRY_OPTIONS, COUNTRY_OPTIONS_LONG_LIST} from '../../shared/select-showcase.data';

const createLongString = (len: number, char: string = 'W') => {
  return (new Array(len))
    .fill(char)
    .join('');
};

@Component({
  selector: 'app-select-field-overview',
  templateUrl: './select-field-overview.component.html',
  styleUrl: './select-field-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuSelectFieldComponent,
    ShowcaseLayoutComponent,
  ],
})
export class SelectFieldOverviewComponent {
  public readonly SIZES = Object.values(SIZE).filter((size) => size !== SIZE.S);

  protected readonly countryOptions = COUNTRY_OPTIONS;
  protected readonly countryOptionsLongList = COUNTRY_OPTIONS_LONG_LIST;

  protected readonly longLabelsOptionsList: NdwuOption[] = [
    {
      value: 'opt-1',
      label: `Option's container width is limited to 640px; ${createLongString(100, 'W')}`,
    },
    {
      value: 'opt-2',
      // dprint-ignore
      label: `On mobile screens long options will be truncated after filling two whole lines; ${createLongString(100, '-')}`,
    },
  ];

  protected readonly formLongOptions = new FormGroup({
    longOptionSelect: new FormControl(''),
  });

  protected readonly formBasic = new FormGroup({
    country: new FormControl(''),
  });

  protected readonly formDisabled = new FormGroup({
    country: new FormControl({value: 'ch', disabled: true}),
  });

  protected readonly formRequired = new FormGroup({
    country: new FormControl('', Validators.required),
  });

  protected readonly formSizes = new FormGroup({
    countryS: new FormControl(''),
    countryL: new FormControl(''),
    countryXL: new FormControl(''),
    countryXXL: new FormControl(''),
  });
}

import {ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NDWU_SIZE, NdwuButtonComponent, NdwuOption, NdwuOptionGroup} from '@ndw-ui-kit/core';
import {NdwuSelectFieldComponent, NdwuValidators} from '@ndw-ui-kit/core/form-field';
import {ShowcaseLayoutComponent} from '@app/components';
import {
  CONTINENT_GROUPS,
  COUNTRY_OPTIONS,
  COUNTRY_OPTIONS_GROUPED,
  COUNTRY_OPTIONS_LONG_LIST,
  COUNTRY_OPTIONS_WITH_HIDDEN,
  USER_PROVIDED_LABEL_OPTIONS,
} from '../../shared/select-showcase.data';

const createLongString = (len: number, char: string = 'W') => {
  return (new Array(len))
    .fill(char)
    .join('');
};

const DYNAMIC_OPTIONS_STEP = 3;
const DYNAMIC_OPTIONS_MIN = 1;
const DYNAMIC_OPTIONS_MAX = 15;
const DYNAMIC_OPTIONS_AUTO_INTERVAL_MS = 1500;

@Component({
  selector: 'app-select-field-overview',
  templateUrl: './select-field-overview.component.html',
  styleUrl: './select-field-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuButtonComponent,
    NdwuSelectFieldComponent,
    ShowcaseLayoutComponent,
  ],
})
export class SelectFieldOverviewComponent {
  public readonly SIZES = Object.values(NDWU_SIZE).filter((size) => size !== NDWU_SIZE.S);

  protected readonly countryOptions = COUNTRY_OPTIONS;
  protected readonly countryOptionsLongList = COUNTRY_OPTIONS_LONG_LIST;
  protected readonly countryOptionsWithHidden = COUNTRY_OPTIONS_WITH_HIDDEN;
  protected readonly countryOptionsGrouped = COUNTRY_OPTIONS_GROUPED;
  protected readonly continentGroups: NdwuOptionGroup[] = CONTINENT_GROUPS;
  protected readonly userProvidedLabelOptions = USER_PROVIDED_LABEL_OPTIONS;

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

  protected readonly formHiddenOption = new FormGroup({
    country: new FormControl('legacy-region'),
  });

  protected readonly formGrouped = new FormGroup({
    country: new FormControl(''),
  });

  protected readonly formNoLocalize = new FormGroup({
    tag: new FormControl(''),
  });

  protected readonly formDisabled = new FormGroup({
    country: new FormControl({value: 'ch', disabled: true}),
  });

  protected readonly formRequired = new FormGroup({
    country: new FormControl('', NdwuValidators.required()),
  });

  protected readonly formDynamicOptions = new FormGroup({
    option: new FormControl(''),
  });

  protected readonly formSizes = new FormGroup({
    countryS: new FormControl(''),
    countryL: new FormControl(''),
    countryXL: new FormControl(''),
    countryXXL: new FormControl(''),
  });

  protected readonly DYNAMIC_OPTIONS_STEP = DYNAMIC_OPTIONS_STEP;
  protected readonly dynamicOptionsCount = signal(DYNAMIC_OPTIONS_STEP);
  protected readonly isDynamicOptionsAutoOn = signal(false);
  protected readonly dynamicOptions = computed<NdwuOption[]>(() => {
    return Array.from({length: this.dynamicOptionsCount()}, (_, index) => {
      return {
        value: `option-${index + 1}`,
        label: `Option ${index + 1}`,
      };
    });
  });

  private dynamicOptionsAutoTimerId: ReturnType<typeof setInterval> | null = null;
  private dynamicOptionsAutoDirection: 1 | -1 = 1;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopDynamicOptionsAuto());
  }

  protected addDynamicOptions(): void {
    this.dynamicOptionsCount.update(count => {
      return Math.min(DYNAMIC_OPTIONS_MAX, count + DYNAMIC_OPTIONS_STEP);
    });
  }

  protected removeDynamicOptions(): void {
    this.dynamicOptionsCount.update(count => {
      return Math.max(DYNAMIC_OPTIONS_MIN, count - DYNAMIC_OPTIONS_STEP);
    });
  }

  // Clicking outside closes the panel, so the list changes on a timer to be observed while open.
  protected toggleDynamicOptionsAuto(): void {
    if (this.dynamicOptionsAutoTimerId !== null) {
      this.stopDynamicOptionsAuto();

      return;
    }

    this.isDynamicOptionsAutoOn.set(true);

    this.dynamicOptionsAutoTimerId = setInterval(
      () => this.stepDynamicOptionsAuto(),
      DYNAMIC_OPTIONS_AUTO_INTERVAL_MS,
    );
  }

  private stepDynamicOptionsAuto(): void {
    const count = this.dynamicOptionsCount();

    if (count >= DYNAMIC_OPTIONS_MAX) {
      this.dynamicOptionsAutoDirection = -1;
    } else if (count <= DYNAMIC_OPTIONS_MIN) {
      this.dynamicOptionsAutoDirection = 1;
    }

    if (this.dynamicOptionsAutoDirection === 1) {
      this.addDynamicOptions();
    } else {
      this.removeDynamicOptions();
    }
  }

  private stopDynamicOptionsAuto(): void {
    if (this.dynamicOptionsAutoTimerId !== null) {
      clearInterval(this.dynamicOptionsAutoTimerId);
    }

    this.dynamicOptionsAutoTimerId = null;

    this.isDynamicOptionsAutoOn.set(false);
  }
}

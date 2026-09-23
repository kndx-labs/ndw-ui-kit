import {ChangeDetectionStrategy, Component, ViewEncapsulation, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  NdwuButtonComponent,
  NdwuFormContainerComponent,
  type NdwuOption,
  type NdwuScheduleValue,
  SIZE,
} from '@ndw-ui-kit/core';
import {
  NdwuCheckboxFieldComponent,
  NdwuInputFieldComponent,
  NdwuMultiSelectFieldComponent,
  NdwuRadioFieldComponent,
  NdwuScheduleEditorFieldComponent,
  NdwuSelectFieldComponent,
  NdwuToggleFieldComponent,
} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

const COUNTRY_OPTIONS: NdwuOption[] = [
  {value: 'de', label: 'Germany'},
  {value: 'ch', label: 'Switzerland'},
  {value: 'at', label: 'Austria'},
  {value: 'fr', label: 'France'},
  {value: 'it', label: 'Italy'},
  {value: 'us', label: 'United States'},
  {value: 'gb', label: 'United Kingdom'},
  {value: 'nl', label: 'Netherlands'},
];

const TIMEZONE_OPTIONS: NdwuOption[] = [
  {value: 'utc', label: 'UTC'},
  {value: 'europe-berlin', label: 'Europe / Berlin'},
  {value: 'europe-london', label: 'Europe / London'},
  {value: 'us-eastern', label: 'US / Eastern'},
  {value: 'us-pacific', label: 'US / Pacific'},
  {value: 'asia-tokyo', label: 'Asia / Tokyo'},
];

const LANGUAGE_OPTIONS: NdwuOption[] = [
  {value: 'en', label: 'English'},
  {value: 'de', label: 'Deutsch'},
  {value: 'fr', label: 'Français'},
  {value: 'it', label: 'Italiano'},
];

const ROLE_OPTIONS: NdwuOption[] = [
  {value: 'admin', label: 'Administrator'},
  {value: 'editor', label: 'Editor'},
  {value: 'viewer', label: 'Viewer'},
];

const SKILL_OPTIONS: NdwuOption[] = [
  {value: 'angular', label: 'Angular'},
  {value: 'react', label: 'React'},
  {value: 'vue', label: 'Vue'},
  {value: 'nodejs', label: 'Node.js'},
  {value: 'python', label: 'Python'},
  {value: 'java', label: 'Java'},
];

const CITY_OPTIONS: NdwuOption[] = [
  {value: 'berlin', label: 'Berlin'},
  {value: 'munich', label: 'Munich'},
  {value: 'hamburg', label: 'Hamburg'},
  {value: 'zurich', label: 'Zurich'},
  {value: 'vienna', label: 'Vienna'},
  {value: 'paris', label: 'Paris'},
  {value: 'london', label: 'London'},
  {value: 'new-york', label: 'New York'},
];

const DEFAULT_SCHEDULE: NdwuScheduleValue = {
  mon: [[540, 1080]],
  tue: [[540, 1080]],
  wed: [[540, 1080]],
  thu: [[540, 1080]],
  fri: [[540, 1080]],
  sat: [],
  sun: [],
};

@Component({
  selector: 'app-user-profile-form-overview',
  templateUrl: './user-profile-form-overview.component.html',
  styleUrl: './user-profile-form-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ReactiveFormsModule,
    LocalizePipe,
    ShowcaseLayoutComponent,
    NdwuFormContainerComponent,
    NdwuInputFieldComponent,
    NdwuSelectFieldComponent,
    NdwuMultiSelectFieldComponent,
    NdwuCheckboxFieldComponent,
    NdwuToggleFieldComponent,
    NdwuRadioFieldComponent,
    NdwuScheduleEditorFieldComponent,
    NdwuButtonComponent,
  ],
})
export class UserProfileFormOverviewComponent {
  public readonly SIZE = SIZE;

  public readonly countryOptions = COUNTRY_OPTIONS;
  public readonly timezoneOptions = TIMEZONE_OPTIONS;
  public readonly languageOptions = LANGUAGE_OPTIONS;
  public readonly roleOptions = ROLE_OPTIONS;
  public readonly skillOptions = SKILL_OPTIONS;
  public readonly cityOptions = CITY_OPTIONS;

  public readonly isSubmitted = signal(false);
  public readonly isLoading = signal(false);

  public readonly form = new FormGroup({
    // Personal Info
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
    city: new FormControl(''),

    // Account
    role: new FormControl('editor', [Validators.required]),
    country: new FormControl('de', [Validators.required]),
    skills: new FormControl<string[]>([], [Validators.required]),

    // Preferences
    language: new FormControl('en'),
    timezone: new FormControl('europe-berlin'),
    darkMode: new FormControl(false),
    compactLayout: new FormControl(false),

    // Notifications
    emailNotifications: new FormControl(true),
    pushNotifications: new FormControl(false),
    weeklyDigest: new FormControl(true),
    marketingEmails: new FormControl(false),

    // Schedule
    schedule: new FormControl<NdwuScheduleValue>(DEFAULT_SCHEDULE),

    // Terms
    termsAccepted: new FormControl(false, [Validators.requiredTrue]),
  });

  public onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
      this.isSubmitted.set(true);
    }, 1500);
  }

  public onReset(): void {
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      role: 'editor',
      country: 'de',
      skills: [],
      language: 'en',
      timezone: 'europe-berlin',
      darkMode: false,
      compactLayout: false,
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      marketingEmails: false,
      schedule: DEFAULT_SCHEDULE,
      termsAccepted: false,
    });
    this.isSubmitted.set(false);
  }
}

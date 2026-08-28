import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  DEFAULT_WEEK_DAYS,
  type DayName,
  type ScheduleAction,
  type ScheduleValue,
  type WeekDay,
  scheduleValueToActions,
} from '@ndw-ui-kit/core';
import {NdwuScheduleEditorFieldComponent} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe, UiKitTranslationService} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

const SAMPLE_VALUE: ScheduleValue = {
  mon: [[540, 1080]],
  tue: [[540, 1080]],
  wed: [[540, 1080]],
  thu: [[540, 1080]],
  fri: [[540, 1080]],
  sat: [],
  sun: [],
};

const SUNDAY_FIRST_WEEK_DAYS: WeekDay[] = [
  {day: 'sun', label: 'Sun'},
  {day: 'mon', label: 'Mon'},
  {day: 'tue', label: 'Tue'},
  {day: 'wed', label: 'Wed'},
  {day: 'thu', label: 'Thu'},
  {day: 'fri', label: 'Fri'},
  {day: 'sat', label: 'Sat'},
];

const WEEKDAY_KEYS: Record<DayName, string> = {
  mon: 'schedule-editor-showcase.weekdays.mon',
  tue: 'schedule-editor-showcase.weekdays.tue',
  wed: 'schedule-editor-showcase.weekdays.wed',
  thu: 'schedule-editor-showcase.weekdays.thu',
  fri: 'schedule-editor-showcase.weekdays.fri',
  sat: 'schedule-editor-showcase.weekdays.sat',
  sun: 'schedule-editor-showcase.weekdays.sun',
};

@Component({
  selector: 'app-schedule-editor-overview',
  templateUrl: './schedule-editor-overview.component.html',
  styleUrl: './schedule-editor-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    NdwuScheduleEditorFieldComponent,
    ShowcaseLayoutComponent,
    LocalizePipe,
  ],
})
export class ScheduleEditorOverviewComponent {
  private readonly translationService = inject(UiKitTranslationService);
  private readonly cdr = inject(ChangeDetectorRef);

  public scheduleValue: ScheduleValue = {...SAMPLE_VALUE};
  public weekDays: WeekDay[] = this.buildWeekDays(DEFAULT_WEEK_DAYS);
  public sundayFirstWeekDays: WeekDay[] = this.buildWeekDays(SUNDAY_FIRST_WEEK_DAYS);

  public get scheduleActions(): ScheduleAction[] {
    return scheduleValueToActions(this.scheduleValue, this.weekDays);
  }

  constructor() {
    this.translationService.onLangChange$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.weekDays = this.buildWeekDays(DEFAULT_WEEK_DAYS);
        this.sundayFirstWeekDays = this.buildWeekDays(SUNDAY_FIRST_WEEK_DAYS);
        this.cdr.markForCheck();
      });
  }

  private buildWeekDays(source: WeekDay[]): WeekDay[] {
    return source.map((wd) => {
      return {
        day: wd.day,
        label: this.translationService.instant(WEEKDAY_KEYS[wd.day] ?? ''),
      };
    });
  }
}

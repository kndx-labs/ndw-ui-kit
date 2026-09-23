import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ThemeSwitcherComponent} from '@app/components';
import {
  DEFAULT_WEEK_DAYS,
  NDWU_SCHEDULE_EDITOR_LAYOUT,
  NDWU_SCHEDULE_EDITOR_MODE,
  NDWU_SCHEDULE_EDITOR_SIZING,
  type NdwuScheduleEditorLayout,
  type NdwuScheduleEditorMode,
  type NdwuScheduleEditorSizing,
  type NdwuScheduleValue,
  type NdwuWeekDay,
} from '@ndw-ui-kit/core';
import {NdwuScheduleEditorFieldComponent} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';

type CvaPreviewTheme = 'light' | 'dark';
type WeekStart = 'monday' | 'sunday';
type LayoutOption = 'auto' | NdwuScheduleEditorLayout;

const SUNDAY_FIRST_WEEK_DAYS: NdwuWeekDay[] = [
  {day: 'sun', label: 'Sun'},
  {day: 'mon', label: 'Mon'},
  {day: 'tue', label: 'Tue'},
  {day: 'wed', label: 'Wed'},
  {day: 'thu', label: 'Thu'},
  {day: 'fri', label: 'Fri'},
  {day: 'sat', label: 'Sat'},
];

const SAMPLE_VALUE: NdwuScheduleValue = {
  mon: [[540, 1080]],
  tue: [[540, 1080]],
  wed: [[540, 1080]],
  thu: [[540, 1080]],
  fri: [[540, 1080]],
  sat: [],
  sun: [],
};

@Component({
  selector: 'app-schedule-editor-cva-preview',
  templateUrl: './schedule-editor-cva-preview.component.html',
  styleUrl: './schedule-editor-cva-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NdwuScheduleEditorFieldComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
  ],
})
export class ScheduleEditorCvaPreviewComponent implements OnInit {
  public readonly MODE = NDWU_SCHEDULE_EDITOR_MODE;
  public readonly LAYOUT = NDWU_SCHEDULE_EDITOR_LAYOUT;
  protected readonly sizingOptions = Object.values(NDWU_SCHEDULE_EDITOR_SIZING);

  public readonly sandboxTheme = signal<CvaPreviewTheme>('light');

  public readonly sandboxForm = new FormGroup({
    scheduleValue: new FormControl<NdwuScheduleValue>({...SAMPLE_VALUE}, {nonNullable: true}),
    mode: new FormControl<NdwuScheduleEditorMode>(NDWU_SCHEDULE_EDITOR_MODE.FULL, {nonNullable: true}),
    forceLayout: new FormControl<LayoutOption>('auto', {nonNullable: true}),
    weekStart: new FormControl<WeekStart>('monday', {nonNullable: true}),
    sizing: new FormControl<NdwuScheduleEditorSizing>(
      NDWU_SCHEDULE_EDITOR_SIZING.SCALE,
      {nonNullable: true},
    ),
  });

  public weekDays: NdwuWeekDay[] = [];

  public ngOnInit(): void {
    this.updateWeekDays();
    this.sandboxForm.controls.weekStart.valueChanges.subscribe(() => this.updateWeekDays());
  }

  public setSandboxTheme(theme: CvaPreviewTheme): void {
    this.sandboxTheme.set(theme);
  }

  public resetSandbox(): void {
    this.sandboxTheme.set('light');

    this.sandboxForm.reset({
      scheduleValue: {...SAMPLE_VALUE},
      mode: NDWU_SCHEDULE_EDITOR_MODE.FULL,
      forceLayout: 'auto',
      weekStart: 'monday',
      sizing: NDWU_SCHEDULE_EDITOR_SIZING.SCALE,
    });

    this.updateWeekDays();
  }

  public getForceLayoutValue(): NdwuScheduleEditorLayout | null {
    const layout = this.sandboxForm.controls.forceLayout.value;

    return layout === 'auto' ? null : layout;
  }

  private updateWeekDays(): void {
    const weekStart = this.sandboxForm.controls.weekStart.value;

    this.weekDays = weekStart === 'sunday' ? SUNDAY_FIRST_WEEK_DAYS : DEFAULT_WEEK_DAYS;
  }
}

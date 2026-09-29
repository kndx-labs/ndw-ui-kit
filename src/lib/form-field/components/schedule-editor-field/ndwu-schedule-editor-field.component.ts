import {Component, DestroyRef, OnInit, input, signal} from '@angular/core';
import {NgControl} from '@angular/forms';
import {
  NDWU_DEFAULT_WEEK_DAYS,
  NDWU_SCHEDULE_EDITOR_MODE,
  NDWU_SCHEDULE_EDITOR_SIZING,
  NdwuScheduleEditorComponent,
  type NdwuScheduleEditorLayout,
  type NdwuScheduleEditorMode,
  type NdwuScheduleEditorSizing,
  type NdwuScheduleValue,
  type NdwuWeekDay,
} from '@ndw-ui-kit/core/widgets';
import {FormFieldBase} from '../../classes/form-field-base';
import {setValueAccessor, syncIsInvalid} from '../../form-field.utils';

@Component({
  selector: 'ndwu-schedule-editor-field',
  templateUrl: './ndwu-schedule-editor-field.component.html',
  host: {
    '[style.min-height]': '"0"',
  },
  imports: [NdwuScheduleEditorComponent],
})
export class NdwuScheduleEditorFieldComponent extends FormFieldBase<NdwuScheduleValue> implements OnInit {
  public readonly forceLayout = input<NdwuScheduleEditorLayout | null>(null);
  public readonly mode = input<NdwuScheduleEditorMode>(NDWU_SCHEDULE_EDITOR_MODE.FULL);
  public readonly sizing = input<NdwuScheduleEditorSizing>(NDWU_SCHEDULE_EDITOR_SIZING.SCALE);
  public readonly weekDays = input(
    NDWU_DEFAULT_WEEK_DAYS,
    {transform: (value: NdwuWeekDay[] | null | undefined) => value ?? NDWU_DEFAULT_WEEK_DAYS},
  );

  protected readonly isInvalid = signal<boolean>(false);

  constructor(
    protected ngControl: NgControl,
    protected readonly destroyRef$: DestroyRef,
  ) {
    super({});
    setValueAccessor(this.ngControl, this);
  }

  public ngOnInit(): void {
    const control = this.ngControl?.control;

    if (!control) {
      return;
    }

    syncIsInvalid(control, this.isInvalid, this.destroyRef$);
  }

  public onValueChange(value: NdwuScheduleValue): void {
    this.handleChange(value);
  }
}

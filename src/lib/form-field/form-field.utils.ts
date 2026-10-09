import {AbstractControl, ControlValueAccessor, NgControl} from '@angular/forms';
import {DestroyRef, WritableSignal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {merge} from 'rxjs';

export function setValueAccessor(
  ngControl: NgControl,
  accessor: ControlValueAccessor,
): void {
  ngControl.valueAccessor = accessor;
}

/** Whether the control should be displayed as invalid. */
export function isControlInvalid(control: AbstractControl): boolean {
  return control.invalid && (control.touched || control.dirty);
}

/**
 * Calls `update` immediately and on every control state change.
 * Subscribes to status/value/events: `events` covers touched/pristine
 * changes that don't emit `statusChanges`.
 */
export function onControlStateChange(
  control: AbstractControl,
  destroyRef: DestroyRef,
  update: () => void,
): void {
  update();

  merge(control.statusChanges, control.valueChanges, control.events)
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(update);
}

/**
 * Reactively syncs `isControlInvalid(control)` into a WritableSignal.
 */
export function syncIsInvalid(
  control: AbstractControl,
  isInvalid: WritableSignal<boolean>,
  destroyRef: DestroyRef,
): void {
  onControlStateChange(
    control,
    destroyRef,
    () => {
      isInvalid.set(isControlInvalid(control));
    },
  );
}

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

/**
 * Reactively syncs `control.invalid && (control.touched || control.dirty)`
 * into a WritableSignal. Subscribes to status/value/events so the signal
 * updates for validity changes and touch/dirty interaction changes.
 */
export function syncIsInvalid(
  control: AbstractControl,
  isInvalid: WritableSignal<boolean>,
  destroyRef: DestroyRef,
): void {
  const update = (): void => {
    isInvalid.set(control.invalid && (control.touched || control.dirty));
  };

  update();

  merge(control.statusChanges, control.valueChanges, control.events)
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(update);
}

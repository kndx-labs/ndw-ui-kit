import {DestroyRef, Signal} from '@angular/core';

export const stopEvent = (event: Event): void => {
  event.preventDefault();
  event.stopPropagation();
};

/** Like `stopEvent`, but also skips the remaining listeners on the same element */
export const stopEventImmediately = (event: Event): void => {
  event.preventDefault();
  event.stopImmediatePropagation();
};

/**
 * Blocks clicks on the host while `blocked` is true. A capture listener on
 * the target fires before Angular's listeners on it, which Angular coalesces
 * into one native listener, so neither directive handlers such as `RouterLink`
 * nor consumer `(click)` bindings receive the event.
 */
export function blockClicksWhile(el: HTMLElement, blocked: Signal<boolean>, destroyRef: DestroyRef): void {
  const onClick = (event: MouseEvent): void => {
    if (blocked()) {
      stopEventImmediately(event);
    }
  };

  el.addEventListener('click', onClick, {capture: true});
  destroyRef.onDestroy(() => el.removeEventListener('click', onClick, {capture: true}));
}

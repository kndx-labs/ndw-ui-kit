import {DestroyRef, Signal} from '@angular/core';
import {stopEventImmediately} from '@ndw-ui-kit/core/utils';

// Blocks clicks on the host while `loading` is true without `pointer-events: none`,
// so the `not-allowed` cursor is still shown.
// A capture listener on the target fires before regular listeners on it,
// so `(click)` handlers bound by consumers never receive the event.
export function blockClickWhileLoading(el: HTMLElement, loading: Signal<boolean>, destroyRef: DestroyRef): void {
  const onClick = (event: MouseEvent): void => {
    if (loading()) {
      stopEventImmediately(event);
    }
  };

  el.addEventListener('click', onClick, {capture: true});
  destroyRef.onDestroy(() => el.removeEventListener('click', onClick, {capture: true}));
}

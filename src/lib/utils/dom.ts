export const stopEvent = (event: Event): void => {
  event.preventDefault();
  event.stopPropagation();
};

/** Like `stopEvent`, but also skips the remaining listeners on the same element */
export const stopEventImmediately = (event: Event): void => {
  event.preventDefault();
  event.stopImmediatePropagation();
};

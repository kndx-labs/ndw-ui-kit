export const stopEvent = (event: Event): void => {
  event.preventDefault();
  event.stopPropagation();
};

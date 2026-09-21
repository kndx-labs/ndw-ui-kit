/**
 * Overridable strings. Every field is optional: a host supplies either literal
 * text or a translation key, and whatever it leaves out falls back to the
 * component's English default.
 */
export interface NdwuTableTranslationTexts {
  paginator?: {
    itemsPerPage?: string;
    /** Interpolates `start`, `end` and `length`. */
    range?: string;
    /** Shown instead of `range` when there is nothing to page through. */
    rangeEmpty?: string;
    firstPage?: string;
    previousPage?: string;
    nextPage?: string;
    lastPage?: string;
  };
  skeleton?: {
    loading?: string;
  };
  columnPin?: {
    pin?: string;
    unpin?: string;
  };
  rowDragHandle?: {
    reorder?: string;
  };
}

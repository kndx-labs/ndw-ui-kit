/** Literal text or a translation key; missing fields fall back to English. */
export interface NdwuTableTranslationTexts {
  paginator?: {
    itemsPerPage?: string;
    /** Interpolates `start`, `end` and `length`. */
    range?: string;
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
    instructions?: string;
    grabbed?: string;
    moved?: string;
    dropped?: string;
    cancelled?: string;
  };
  columnResize?: {
    resize?: string;
  };
}

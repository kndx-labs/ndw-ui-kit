export interface NdwuModalOpenStrategy {
  /** Animate the current modal as it enters */
  onOpen(overlayElement: HTMLElement): void;

  /** Animate this modal when a child modal opens above it */
  onBeforeChildOpen(overlayElement: HTMLElement): void;

  /** Restore this modal when a child modal finishes closing */
  onAfterChildClose(overlayElement: HTMLElement): void;
}

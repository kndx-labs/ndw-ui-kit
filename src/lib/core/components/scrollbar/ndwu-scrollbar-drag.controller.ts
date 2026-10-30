import type {NdwuDragState} from './ndwu-scrollbar.types';

export interface NdwuScrollbarDragHandlers {
  readonly move: (state: NdwuDragState, event: PointerEvent) => void;
  readonly activeChange: (isActive: boolean) => void;
}

/**
 * Handles one thumb drag: captures the pointer on the thumb, listens to pointer events on the
 * document, and ends the drag in one place for pointerup, pointercancel and end().
 */
export class NdwuScrollbarDragController {
  private state: NdwuDragState | null = null;
  private thumb: HTMLElement | null = null;

  constructor(
    private readonly doc: Document,
    private readonly handlers: NdwuScrollbarDragHandlers,
  ) {}

  public start(event: PointerEvent, thumb: HTMLElement, state: NdwuDragState): void {
    this.end();

    this.state = state;
    this.thumb = thumb;

    thumb.setPointerCapture(event.pointerId);
    this.doc.addEventListener('pointermove', this.onPointerMove, true);
    this.doc.addEventListener('pointerup', this.onPointerEnd, true);
    this.doc.addEventListener('pointercancel', this.onPointerEnd, true);

    this.handlers.activeChange(true);
  }

  public end(): void {
    const {state, thumb} = this;

    if (state === null) {
      return;
    }

    try {
      thumb?.releasePointerCapture(state.pointerId);
    } catch {
      /* the capture is already gone */
    }

    this.doc.removeEventListener('pointermove', this.onPointerMove, true);
    this.doc.removeEventListener('pointerup', this.onPointerEnd, true);
    this.doc.removeEventListener('pointercancel', this.onPointerEnd, true);

    this.state = null;
    this.thumb = null;

    this.handlers.activeChange(false);
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const state = this.state;

    if (event.pointerId !== state?.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.handlers.move(state, event);
  };

  private readonly onPointerEnd = (event: PointerEvent): void => {
    if (event.pointerId !== this.state?.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.end();
  };
}

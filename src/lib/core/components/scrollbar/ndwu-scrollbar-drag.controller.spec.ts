import {describe, expect, it} from 'vitest';
import type {NdwuDragState} from './ndwu-scrollbar.types';
import {NdwuScrollbarDragController} from './ndwu-scrollbar-drag.controller';

class FakeThumb {
  public readonly captured = new Set<number>();

  public setPointerCapture(pointerId: number): void {
    this.captured.add(pointerId);
  }

  public releasePointerCapture(pointerId: number): void {
    this.captured.delete(pointerId);
  }
}

const DRAG_STATE: NdwuDragState = {axis: 'y', pointerId: 1, pointerOffset: 5, trackStart: 10};

const pointerEvent = (type: string, pointerId: number): PointerEvent => {
  return Object.assign(new Event(type, {cancelable: true}), {pointerId}) as PointerEvent;
};

const setup = () => {
  const doc = new EventTarget();
  const thumb = new FakeThumb();
  const moves: Array<[NdwuDragState, PointerEvent]> = [];
  const activeChanges: boolean[] = [];
  const controller = new NdwuScrollbarDragController(doc as Document, {
    move: (state, event) => moves.push([state, event]),
    activeChange: (isActive) => activeChanges.push(isActive),
  });
  const start = (): void => {
    controller.start(pointerEvent('pointerdown', 1), thumb as unknown as HTMLElement, DRAG_STATE);
  };

  return {doc, thumb, moves, activeChanges, controller, start};
};

describe('NdwuScrollbarDragController: dragging', () => {
  it('captures the pointer and reports the drag as active', () => {
    const {thumb, activeChanges, start} = setup();

    start();

    expect(thumb.captured.has(1)).toBe(true);
    expect(activeChanges).toEqual([true]);
  });

  it('forwards moves of the dragging pointer with the drag state', () => {
    const {doc, moves, start} = setup();
    const event = pointerEvent('pointermove', 1);

    start();
    doc.dispatchEvent(event);

    expect(moves).toEqual([[DRAG_STATE, event]]);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores moves of other pointers', () => {
    const {doc, moves, start} = setup();

    start();
    doc.dispatchEvent(pointerEvent('pointermove', 2));

    expect(moves).toEqual([]);
  });
});

describe('NdwuScrollbarDragController: ending', () => {
  it.each(['pointerup', 'pointercancel'])('ends the drag on %s', (type) => {
    const {doc, thumb, moves, activeChanges, start} = setup();

    start();
    doc.dispatchEvent(pointerEvent(type, 1));
    doc.dispatchEvent(pointerEvent('pointermove', 1));

    expect(thumb.captured.has(1)).toBe(false);
    expect(moves).toEqual([]);
    expect(activeChanges).toEqual([true, false]);
  });

  it('keeps dragging when another pointer is released', () => {
    const {doc, activeChanges, start} = setup();

    start();
    doc.dispatchEvent(pointerEvent('pointerup', 2));

    expect(activeChanges).toEqual([true]);
  });

  it('ends the drag when cancelled from outside', () => {
    const {doc, thumb, moves, activeChanges, controller, start} = setup();

    start();
    controller.end();
    doc.dispatchEvent(pointerEvent('pointermove', 1));

    expect(thumb.captured.has(1)).toBe(false);
    expect(moves).toEqual([]);
    expect(activeChanges).toEqual([true, false]);
  });

  it('ends the previous drag before starting a new one', () => {
    const {activeChanges, start} = setup();

    start();
    start();

    expect(activeChanges).toEqual([true, false, true]);
  });
});

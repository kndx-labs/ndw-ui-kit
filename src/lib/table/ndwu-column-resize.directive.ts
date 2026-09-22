import {
  AfterViewInit,
  ComponentRef,
  Directive,
  ElementRef,
  Renderer2,
  ViewContainerRef,
  inject,
  input,
  inputBinding,
  output,
} from '@angular/core';
import {stopEvent} from '@ndw-ui-kit/core/utils';
import {NdwuColumnResizeHandleComponent} from './ndwu-column-resize-handle.component';
import type {NdwuTableTranslationTexts} from './ndwu-table.types';

const MIN_COLUMN_WIDTH = 40;

/** Keyboard step, and the larger step taken while a modifier is held. */
const KEYBOARD_STEP = 8;
const KEYBOARD_LARGE_STEP = 40;

/**
 * Adds a resize grip to a header cell. The grip is a component created here
 * rather than declared in a template, because the cell belongs to the host and
 * a sort header may already be the component on that element.
 */
@Directive({
  selector: '[ndwuColumnResize]',
  exportAs: 'ndwuColumnResize',
  host: {
    class: 'ndwu-column-resizable',
  },
})
export class NdwuColumnResizeDirective implements AfterViewInit {
  public readonly resizeTexts = input<NdwuTableTranslationTexts['columnResize']>();

  public readonly ndwuColumnResized = output<number>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly viewContainer = inject(ViewContainerRef);

  private handleRef: ComponentRef<NdwuColumnResizeHandleComponent> | null = null;

  public ngAfterViewInit(): void {
    this.handleRef = this.viewContainer.createComponent(
      NdwuColumnResizeHandleComponent,
      {
        bindings: [
          inputBinding('minWidth', () => MIN_COLUMN_WIDTH),
          inputBinding('resizeTexts', this.resizeTexts),
        ],
      },
    );

    const handle = this.handleRef.location.nativeElement as HTMLElement;

    // The grip is positioned against the header cell, so it is moved inside it.
    this.renderer.appendChild(this.el.nativeElement, handle);
    this.reportWidth(handle, this.el.nativeElement.offsetWidth);

    this.renderer.listen(handle, 'pointerdown', (event: PointerEvent) => this.onPointerDown(handle, event));
    this.renderer.listen(handle, 'keydown', (event: KeyboardEvent) => this.onKeydown(handle, event));
  }

  private onPointerDown(handle: HTMLElement, event: PointerEvent): void {
    // Keeps the drag from starting a text selection or a native drag.
    stopEvent(event);
    handle.setPointerCapture(event.pointerId);

    const startX = event.clientX;
    const startWidth = this.el.nativeElement.offsetWidth;
    const widthAt = (clientX: number): number => Math.max(MIN_COLUMN_WIDTH, startWidth + (clientX - startX));

    // The width the drag has reached, so a release and a cancel report the same value.
    let currentWidth = startWidth;

    // Pointer capture routes every move and the release back to the grip, so
    // no document-level listeners are needed.
    const stops: (() => void)[] = [];

    const finish = (endEvent: PointerEvent): void => {
      stops.forEach(stop => stop());
      handle.releasePointerCapture(endEvent.pointerId);
    };

    // Moves are frequent and change nothing Angular tracks, so this one listener
    // is native: a `Renderer2` listener would schedule change detection per move.
    const onMove = (moveEvent: PointerEvent): void => {
      currentWidth = widthAt(moveEvent.clientX);
      this.applyWidth(handle, currentWidth);
    };

    handle.addEventListener('pointermove', onMove);
    stops.push(() => {
      return handle.removeEventListener('pointermove', onMove);
    });

    stops.push(
      this.renderer.listen(
        handle,
        'pointerup',
        (upEvent: PointerEvent) => {
          currentWidth = widthAt(upEvent.clientX);

          finish(upEvent);
          this.applyWidth(handle, currentWidth);
          this.ndwuColumnResized.emit(currentWidth);
        },
      ),
    );

    // A cancelled pointer keeps the width it reached; only the drag ends.
    stops.push(
      this.renderer.listen(
        handle,
        'pointercancel',
        (cancelEvent: PointerEvent) => {
          finish(cancelEvent);
          this.ndwuColumnResized.emit(currentWidth);
        },
      ),
    );
  }

  private onKeydown(handle: HTMLElement, event: KeyboardEvent): void {
    const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;

    let delta = 0;

    if (event.key === 'ArrowLeft') {
      delta = -step;
    }

    if (event.key === 'ArrowRight') {
      delta = step;
    }

    if (delta === 0) {
      return;
    }

    stopEvent(event);

    const width = Math.max(MIN_COLUMN_WIDTH, this.el.nativeElement.offsetWidth + delta);

    this.applyWidth(handle, width);
    this.ndwuColumnResized.emit(width);
  }

  private applyWidth(handle: HTMLElement, width: number): void {
    this.renderer.setStyle(this.el.nativeElement, 'width', `${width}px`);
    this.reportWidth(handle, width);
  }

  // Written straight to the element: a drag updates it from a native listener,
  // where an input binding would not be picked up until the next render.
  private reportWidth(handle: HTMLElement, width: number): void {
    this.renderer.setAttribute(handle, 'aria-valuenow', `${Math.round(width)}`);
  }
}

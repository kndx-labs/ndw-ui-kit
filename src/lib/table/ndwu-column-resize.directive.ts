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
const MAX_COLUMN_WIDTH = 1000;

const KEYBOARD_STEP = 8;
const KEYBOARD_LARGE_STEP = 40;

const maxWidthFor = (width: number): number => Math.max(MAX_COLUMN_WIDTH, Math.round(width));

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

    this.renderer.appendChild(this.el.nativeElement, handle);

    if (this.table()?.style.width) {
      this.lockLayout();
    }

    this.reportWidth(handle, this.el.nativeElement.offsetWidth);

    this.renderer.listen(handle, 'pointerdown', (event: PointerEvent) => this.onPointerDown(handle, event));
    this.renderer.listen(handle, 'keydown', (event: KeyboardEvent) => this.onKeydown(handle, event));
    this.renderer.listen(handle, 'focus', () => this.reportWidth(handle, this.currentWidth()));
  }

  private onPointerDown(handle: HTMLElement, event: PointerEvent): void {
    stopEvent(event);
    handle.setPointerCapture(event.pointerId);
    this.lockLayout();

    const startX = event.clientX;
    const startWidth = this.currentWidth();
    const widthAt = (clientX: number): number => Math.max(MIN_COLUMN_WIDTH, startWidth + (clientX - startX));

    let currentWidth = startWidth;

    const stops: (() => void)[] = [];

    const finish = (endEvent: PointerEvent): void => {
      stops.forEach(stop => stop());
      handle.releasePointerCapture(endEvent.pointerId);
    };

    // Native: a `Renderer2` listener would run change detection on every move.
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
    if (this.keyboardWidth(event) === null) {
      return;
    }

    stopEvent(event);
    this.lockLayout();

    const width = this.keyboardWidth(event);

    if (width === null || width === this.currentWidth()) {
      return;
    }

    this.applyWidth(handle, width);
    this.ndwuColumnResized.emit(width);
  }

  private keyboardWidth(event: KeyboardEvent): number | null {
    const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
    const width = this.currentWidth();

    switch (event.key) {
      case 'ArrowLeft':
        return Math.max(MIN_COLUMN_WIDTH, width - step);
      case 'ArrowRight':
        return Math.min(maxWidthFor(width), width + step);
      case 'Home':
        return MIN_COLUMN_WIDTH;
      case 'End':
        return maxWidthFor(width);
      default:
        return null;
    }
  }

  private currentWidth(): number {
    return parseFloat(this.el.nativeElement.style.width) || this.el.nativeElement.offsetWidth;
  }

  private applyWidth(handle: HTMLElement, width: number): void {
    this.renderer.setStyle(this.el.nativeElement, 'width', `${width}px`);
    this.syncTableWidth();
    this.reportWidth(handle, width);
  }

  private lockLayout(): void {
    const cells = this.headerCells();

    if (!this.table()?.style.width || !cells.every(cell => cell.style.width.endsWith('px'))) {
      const measured = cells.map(cell => ({cell, width: cell.getBoundingClientRect().width}));

      measured.forEach(({cell, width}) => this.renderer.setStyle(cell, 'width', `${width}px`));
    }

    this.syncTableWidth();
  }

  private syncTableWidth(): void {
    const table = this.table();

    if (!table) {
      return;
    }

    const width = this.headerCells().reduce((sum, cell) => sum + (parseFloat(cell.style.width) || 0), 0);

    this.renderer.setStyle(table, 'width', `${width}px`);
  }

  private headerCells(): HTMLElement[] {
    return Array.from(this.el.nativeElement.parentElement?.children ?? []) as HTMLElement[];
  }

  private table(): HTMLTableElement | null {
    return this.el.nativeElement.closest('table');
  }

  // Set directly: drags update it outside change detection.
  private reportWidth(handle: HTMLElement, width: number): void {
    this.renderer.setAttribute(handle, 'aria-valuenow', `${Math.round(width)}`);
    this.renderer.setAttribute(handle, 'aria-valuemax', `${maxWidthFor(width)}`);
  }
}

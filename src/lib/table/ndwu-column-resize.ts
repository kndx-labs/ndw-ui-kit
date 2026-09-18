import {
  Directive,
  ElementRef,
  inject,
  Output,
  EventEmitter,
  NgZone,
  OnDestroy,
  Renderer2,
  AfterViewInit,
} from '@angular/core';

const MIN_COLUMN_WIDTH = 40;

@Directive({
  selector: '[ndwuColumnResize]',
  host: {
    'class': 'ndwu-column-resizable',
  },
})
export class NdwuColumnResizeDirective implements AfterViewInit, OnDestroy {
  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _zone = inject(NgZone);
  private readonly _renderer = inject(Renderer2);

  @Output() readonly ndwuColumnResized = new EventEmitter<number>();

  private _handle: HTMLElement | null = null;
  private _cleanup: (() => void)[] = [];
  private _activeMoveListener: (() => void) | null = null;
  private _activeUpListener: (() => void) | null = null;

  ngAfterViewInit(): void {
    this._handle = this._renderer.createElement('div');
    this._renderer.addClass(this._handle, 'ndwu-column-resize-handle');
    this._renderer.appendChild(this._el.nativeElement, this._handle);

    this._zone.runOutsideAngular(() => {
      // Grip sits inside the header cell, which may also be a sort header.
      // Without this the drag's trailing click would toggle sorting.
      const click = this._renderer.listen(this._handle, 'click', (e: MouseEvent) => {
        e.stopPropagation();
      });
      this._cleanup.push(click);

      const mousedown = this._renderer.listen(this._handle, 'mousedown', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.pageX;
        const startWidth = this._el.nativeElement.offsetWidth;

        const onMove = (me: MouseEvent) => {
          const newWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + (me.pageX - startX));
          this._renderer.setStyle(this._el.nativeElement, 'width', `${newWidth}px`);
        };

        const onUp = (me: MouseEvent) => {
          this._teardownDrag();
          const finalWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + (me.pageX - startX));
          this._zone.run(() => this.ndwuColumnResized.emit(finalWidth));
        };

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        this._activeMoveListener = () => document.removeEventListener('mousemove', onMove);
        this._activeUpListener = () => document.removeEventListener('mouseup', onUp);
      });
      this._cleanup.push(mousedown);
    });
  }

  ngOnDestroy(): void {
    this._teardownDrag();
    this._cleanup.forEach(fn => fn());
    if (this._handle) {
      this._renderer.removeChild(this._el.nativeElement, this._handle);
    }
  }

  private _teardownDrag(): void {
    this._activeMoveListener?.();
    this._activeUpListener?.();
    this._activeMoveListener = null;
    this._activeUpListener = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
}

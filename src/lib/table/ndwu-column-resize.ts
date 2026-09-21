import {
  Directive,
  ElementRef,
  inject,
  output,
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
  public readonly ndwuColumnResized = output<number>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly renderer = inject(Renderer2);

  private handle: HTMLElement | null = null;
  private cleanup: (() => void)[] = [];
  private activeMoveListener: (() => void) | null = null;
  private activeUpListener: (() => void) | null = null;

  public ngAfterViewInit(): void {
    this.handle = this.renderer.createElement('div');
    this.renderer.addClass(this.handle, 'ndwu-column-resize-handle');
    this.renderer.appendChild(this.el.nativeElement, this.handle);

    this.zone.runOutsideAngular(() => {
      // Grip sits inside the header cell, which may also be a sort header.
      // Without this the drag's trailing click would toggle sorting.
      const click = this.renderer.listen(this.handle, 'click', (event: MouseEvent) => {
        event.stopPropagation();
      });

      this.cleanup.push(click);

      const mousedown = this.renderer.listen(this.handle, 'mousedown', (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const startX = event.pageX;
        const startWidth = this.el.nativeElement.offsetWidth;

        const widthAt = (pageX: number): number => Math.max(MIN_COLUMN_WIDTH, startWidth + (pageX - startX));

        const onMove = (moveEvent: MouseEvent) => {
          this.renderer.setStyle(this.el.nativeElement, 'width', `${widthAt(moveEvent.pageX)}px`);
        };

        const onUp = (upEvent: MouseEvent) => {
          this.teardownDrag();
          this.zone.run(() => this.ndwuColumnResized.emit(widthAt(upEvent.pageX)));
        };

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        this.activeMoveListener = () => document.removeEventListener('mousemove', onMove);
        this.activeUpListener = () => document.removeEventListener('mouseup', onUp);
      });

      this.cleanup.push(mousedown);
    });
  }

  public ngOnDestroy(): void {
    this.teardownDrag();
    this.cleanup.forEach(fn => fn());

    if (this.handle) {
      this.renderer.removeChild(this.el.nativeElement, this.handle);
    }
  }

  private teardownDrag(): void {
    this.activeMoveListener?.();
    this.activeUpListener?.();
    this.activeMoveListener = null;
    this.activeUpListener = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
}

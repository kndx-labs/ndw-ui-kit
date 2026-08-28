import {Directive, ElementRef, OnDestroy, effect, inject, input, output, signal} from '@angular/core';

export interface NdwuResizeObserverEntry {
  width: number;
  height: number;
}

@Directive({
  selector: '[ndwuResizeObserver]',
  standalone: true,
  exportAs: 'ndwuResizeObserver',
})
export class NdwuResizeObserverDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /** True observes the host element; false disconnects the observer. */
  public readonly ndwuResizeObserver = input<boolean>(true);
  public readonly elementResize = output<NdwuResizeObserverEntry>();

  public readonly width = signal<number>(0);
  public readonly height = signal<number>(0);
  public readonly measured = signal<boolean>(false);

  private observer: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      if (this.ndwuResizeObserver()) {
        this.setupResizeObserver();
      } else {
        this.disconnectResizeObserver();
      }
    });
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined' || this.observer) {
      return;
    }

    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const {width, height} = entry.contentRect;

        this.width.set(width);
        this.height.set(height);
        this.measured.set(true);
        this.elementResize.emit({width, height});
      }
    });

    const el = this.elementRef.nativeElement as Element;

    this.observer.observe(el);
  }

  private disconnectResizeObserver(): void {
    this.observer?.disconnect();

    this.observer = null;
  }

  public ngOnDestroy(): void {
    this.disconnectResizeObserver();
  }
}

import {
  AfterViewInit,
  Directive,
  ElementRef,
  NgZone,
  Renderer2,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {UiKitTranslationService} from '@ndw-ui-kit/core/l10n';
import type {NdwuTableTranslationTexts} from './ndwu-table.types';

const MIN_COLUMN_WIDTH = 40;

/** Keyboard step, and the larger step taken while a modifier is held. */
const KEYBOARD_STEP = 8;
const KEYBOARD_LARGE_STEP = 40;

const DEFAULT_COLUMN_RESIZE_TEXTS = {
  resize: 'Resize column',
};

/**
 * Adds a resize grip to a header cell. The grip is created here rather than in
 * a template because the cell it attaches to belongs to the host, and a sort
 * header may already be the component on that element.
 */
@Directive({
  selector: '[ndwuColumnResize]',
  host: {
    class: 'ndwu-column-resizable',
  },
})
export class NdwuColumnResizeDirective implements AfterViewInit {
  public readonly resizeTexts = input<NdwuTableTranslationTexts['columnResize']>();

  public readonly ndwuColumnResized = output<number>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly renderer = inject(Renderer2);
  private readonly translation = inject(UiKitTranslationService);

  private readonly handle = signal<HTMLElement | null>(null);
  private readonly language = toSignal(this.translation.onLangChange$, {initialValue: null});

  private readonly effectiveTexts = computed(() => ({
    ...DEFAULT_COLUMN_RESIZE_TEXTS,
    ...this.resizeTexts(),
  }));

  constructor() {
    effect(() => {
      const handle = this.handle();

      if (!handle) {
        return;
      }

      // Re-read the label whenever the dictionary or the texts input changes.
      this.language();

      this.renderer.setAttribute(handle, 'aria-label', this.translation.instant(this.effectiveTexts().resize));
    });
  }

  public ngAfterViewInit(): void {
    const handle = this.renderer.createElement('div') as HTMLElement;

    this.renderer.addClass(handle, 'ndwu-column-resizable__handle');
    this.renderer.setAttribute(handle, 'role', 'separator');
    this.renderer.setAttribute(handle, 'aria-orientation', 'vertical');
    this.renderer.setAttribute(handle, 'tabindex', '0');
    this.renderer.setAttribute(handle, 'aria-valuemin', `${MIN_COLUMN_WIDTH}`);
    this.renderer.appendChild(this.el.nativeElement, handle);

    this.reportWidth(handle, this.el.nativeElement.offsetWidth);
    this.handle.set(handle);

    // Pointer moves are frequent and change nothing Angular tracks, so they run
    // outside the zone; only the final width re-enters it.
    this.zone.runOutsideAngular(() => {
      this.renderer.listen(handle, 'pointerdown', (event: PointerEvent) => this.onPointerDown(handle, event));
      this.renderer.listen(handle, 'keydown', (event: KeyboardEvent) => this.onKeydown(handle, event));
    });
  }

  private onPointerDown(handle: HTMLElement, event: PointerEvent): void {
    // Keeps the drag from starting a text selection or a native drag.
    event.preventDefault();
    event.stopPropagation();
    handle.setPointerCapture(event.pointerId);

    const startX = event.clientX;
    const startWidth = this.el.nativeElement.offsetWidth;
    const widthAt = (clientX: number): number => Math.max(MIN_COLUMN_WIDTH, startWidth + (clientX - startX));

    // Pointer capture routes every move and the release back to the grip, so
    // no document-level listeners are needed.
    const stops: (() => void)[] = [];

    const finish = (endEvent: PointerEvent): void => {
      stops.forEach(stop => stop());
      handle.releasePointerCapture(endEvent.pointerId);
    };

    stops.push(this.renderer.listen(handle, 'pointermove', (moveEvent: PointerEvent) => {
      this.applyWidth(handle, widthAt(moveEvent.clientX));
    }));

    stops.push(this.renderer.listen(handle, 'pointerup', (upEvent: PointerEvent) => {
      const width = widthAt(upEvent.clientX);

      finish(upEvent);
      this.applyWidth(handle, width);
      this.zone.run(() => this.ndwuColumnResized.emit(width));
    }));

    // A cancelled pointer keeps the width it reached; only the drag ends.
    stops.push(this.renderer.listen(handle, 'pointercancel', (cancelEvent: PointerEvent) => {
      finish(cancelEvent);
      this.zone.run(() => this.ndwuColumnResized.emit(this.el.nativeElement.offsetWidth));
    }));
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

    event.preventDefault();
    event.stopPropagation();

    const width = Math.max(MIN_COLUMN_WIDTH, this.el.nativeElement.offsetWidth + delta);

    this.applyWidth(handle, width);
    this.zone.run(() => this.ndwuColumnResized.emit(width));
  }

  private applyWidth(handle: HTMLElement, width: number): void {
    this.renderer.setStyle(this.el.nativeElement, 'width', `${width}px`);
    this.reportWidth(handle, width);
  }

  private reportWidth(handle: HTMLElement, width: number): void {
    this.renderer.setAttribute(handle, 'aria-valuenow', `${Math.round(width)}`);
  }
}

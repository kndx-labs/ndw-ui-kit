import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Signal,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import {NdwuScrollbarComponent, NdwuScrollbarPadding} from '@ndw-ui-kit/core';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-scrollbar-touch',
  templateUrl: './scrollbar-touch.component.html',
  styleUrl: './scrollbar-touch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Unscoped so the demo can tint the scrollbar's internal hit-target pseudo-element.
  encapsulation: ViewEncapsulation.None,
  imports: [NdwuScrollbarComponent, ShowcaseLayoutComponent],
})
export class ScrollbarTouchComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostEl: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly win = inject(DOCUMENT).defaultView;

  protected readonly isCoarsePrimary = this.watchMedia('(pointer: coarse)');
  protected readonly hasAnyFinePointer = this.watchMedia('(any-pointer: fine)');
  protected readonly canHover = this.watchMedia('(hover: hover)');
  protected readonly lastPointerType = signal('none yet');

  protected readonly isTargetHighlighted = signal(true);
  protected readonly isAutoHide = signal(false);
  protected readonly touchTargetSizePx = signal(44);
  protected readonly hideDelayMs = signal(1000);
  protected readonly lastTap = signal('none yet');
  protected readonly tapCount = signal(0);

  protected readonly rows = Array.from({length: 20}, (_, index) => index + 1);

  protected readonly pixelTrackPadding: NdwuScrollbarPadding = {
    right: '40px',
    bottom: '32px',
  };

  protected readonly percentTrackPadding: NdwuScrollbarPadding = {
    right: '10%',
    bottom: '10%',
  };

  protected readonly calcTrackPadding: NdwuScrollbarPadding = {
    right: 'calc(8px + 5%)',
    bottom: 'calc(6px + 4%)',
  };

  constructor() {
    // Capture phase: the thumb stops propagation of the pointerdown it claims.
    const onPointerDown = (event: PointerEvent): void => {
      this.lastPointerType.set(event.pointerType || 'unknown');
    };

    this.hostEl.addEventListener('pointerdown', onPointerDown, {capture: true});
    this.destroyRef.onDestroy(() => {
      this.hostEl.removeEventListener('pointerdown', onPointerDown, {capture: true});
    });
  }

  protected toggleTargetHighlight(): void {
    this.isTargetHighlighted.update((isHighlighted) => !isHighlighted);
  }

  protected toggleAutoHide(): void {
    this.isAutoHide.update((isAutoHide) => !isAutoHide);
  }

  protected touchTargetSize(): string {
    return `${this.touchTargetSizePx()}px`;
  }

  protected updateTouchTargetSize(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    this.touchTargetSizePx.set(Number.isFinite(value) ? value : 44);
  }

  protected updateHideDelay(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    this.hideDelayMs.set(Number.isFinite(value) ? value : 1000);
  }

  protected registerTap(label: string): void {
    this.lastTap.set(label);
    this.tapCount.update((count) => count + 1);
  }

  private watchMedia(query: string): Signal<boolean> {
    const mediaQuery = this.win?.matchMedia?.(query);
    const matches = signal(mediaQuery?.matches ?? false);

    if (!mediaQuery) {
      return matches.asReadonly();
    }

    const onChange = (event: MediaQueryListEvent): void => {
      matches.set(event.matches);
    };

    mediaQuery.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => {
      mediaQuery.removeEventListener('change', onChange);
    });

    return matches.asReadonly();
  }
}

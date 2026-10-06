/* eslint id-denylist: 0 */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  NDWU_ICON_NAME,
  NDWU_INTERACTION_FOCUS_TYPES,
  NdwuIconComponent,
  NdwuInteractionRegistry,
  NdwuModalService,
} from '@ndw-ui-kit/core';

@Component({
  selector: 'app-interaction-debug-panel',
  templateUrl: './interaction-debug-panel.component.html',
  styleUrl: './interaction-debug-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuIconComponent],
})
export class InteractionDebugPanelComponent implements OnInit, AfterViewInit {
  private static readonly COLLAPSED_STORAGE_KEY = 'ndwu-playground-interaction-debug-panel-collapsed';
  private static readonly POSITION_STORAGE_KEY = 'ndwu-playground-interaction-debug-panel-position';

  private readonly destroyRef = inject(DestroyRef);
  private readonly interactionRegistry = inject(NdwuInteractionRegistry);
  private readonly modalService = inject(NdwuModalService);
  private readonly panelRef = viewChild.required<ElementRef<HTMLElement>>('panel');

  private dragOffset: {x: number; y: number} | null = null;
  private cleanupDragListeners: (() => void) | null = null;

  public readonly ICON_NAME = NDWU_ICON_NAME;
  public readonly isCollapsed = signal(false);
  public readonly position = signal<{left: number; top: number} | null>(null);
  public readonly openModalCount = computed(() => this.modalService.openModalCount());
  public readonly hasFocusedControl = this.interactionRegistry.getFocusedStateSignal(NDWU_INTERACTION_FOCUS_TYPES);
  public readonly hasBlockingOverlay = this.interactionRegistry.hasBlockingOverlay;
  public readonly statusRows = computed(() => {
    return [
      {label: 'focused control', value: this.hasFocusedControl()},
      ...NDWU_INTERACTION_FOCUS_TYPES.map(type => {
        return {
          label: `  -  ${type}`,
          value: this.interactionRegistry.getFocusedStateSignal(type)(),
        };
      }),
      {label: 'blocking overlay', value: this.hasBlockingOverlay()},
    ];
  });

  public ngOnInit(): void {
    this.isCollapsed.set(this.readCollapsedState());
  }

  public ngAfterViewInit(): void {
    this.position.set(this.readPosition());

    requestAnimationFrame(() => {
      this.ensurePosition();
      this.clampPositionToViewport(true);
    });

    const handleResize = (): void => {
      this.clampPositionToViewport(true);
    };

    window.addEventListener('resize', handleResize);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', handleResize);
      this.cleanupDragListeners?.();
    });
  }

  public toggle(): void {
    this.isCollapsed.update((collapsed) => {
      const next = !collapsed;

      this.writeCollapsedState(next);

      return next;
    });

    requestAnimationFrame(() => {
      this.ensurePosition();
      this.clampPositionToViewport(true);
    });
  }

  public onDragStart(event: PointerEvent): void {
    const target = event.target;

    if (!(target instanceof HTMLElement) || target.closest('.interaction-debug-panel__toggle')) {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    const panelEl = this.panelRef().nativeElement;
    const rect = panelEl.getBoundingClientRect();
    const currentPosition = this.position() ?? {
      left: rect.left,
      top: rect.top,
    };

    this.position.set(currentPosition);

    this.dragOffset = {
      x: event.clientX - currentPosition.left,
      y: event.clientY - currentPosition.top,
    };

    this.cleanupDragListeners?.();

    const onPointerMove = (moveEvent: PointerEvent): void => {
      if (this.dragOffset === null) {
        return;
      }

      this.position.set(this.getClampedPosition({
        left: moveEvent.clientX - this.dragOffset.x,
        top: moveEvent.clientY - this.dragOffset.y,
      }));
    };

    const stopDragging = (): void => {
      this.dragOffset = null;

      this.clampPositionToViewport(true);
      this.cleanupDragListeners?.();

      this.cleanupDragListeners = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);

    this.cleanupDragListeners = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };

    event.preventDefault();
  }

  private ensurePosition(): void {
    if (this.position() !== null) {
      return;
    }

    this.position.set(this.getDefaultPosition());
  }

  private clampPositionToViewport(shouldPersist: boolean): void {
    const panelEl = this.panelRef().nativeElement;
    const rect = panelEl.getBoundingClientRect();
    const clampedPosition = this.getClampedPosition(
      this.position() ?? {
        left: rect.left,
        top: rect.top,
      },
    );

    this.position.set(clampedPosition);

    if (shouldPersist) {
      this.writePosition(clampedPosition);
    }
  }

  private getClampedPosition(position: {left: number; top: number}): {left: number; top: number} {
    const panelEl = this.panelRef().nativeElement;
    const rect = panelEl.getBoundingClientRect();
    const maxLeft = Math.max(0, window.innerWidth - rect.width);
    const maxTop = Math.max(0, window.innerHeight - rect.height);

    return {
      left: this.clamp(position.left, 0, maxLeft),
      top: this.clamp(position.top, 0, maxTop),
    };
  }

  private getDefaultPosition(): {left: number; top: number} {
    const panelEl = this.panelRef().nativeElement;
    const rect = panelEl.getBoundingClientRect();
    const rightOffset = 16;
    const bottomOffset = 16;

    return this.getClampedPosition({
      left: window.innerWidth - rect.width - rightOffset,
      top: window.innerHeight - rect.height - bottomOffset,
    });
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private readCollapsedState(): boolean {
    try {
      return localStorage.getItem(InteractionDebugPanelComponent.COLLAPSED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private writeCollapsedState(collapsed: boolean): void {
    try {
      localStorage.setItem(InteractionDebugPanelComponent.COLLAPSED_STORAGE_KEY, String(collapsed));
    } catch {
      // ignore storage write failures in playground.
    }
  }

  private readPosition(): {left: number; top: number} | null {
    try {
      const rawValue = localStorage.getItem(InteractionDebugPanelComponent.POSITION_STORAGE_KEY);

      if (!rawValue) {
        return null;
      }

      const parsedValue = JSON.parse(rawValue) as Partial<{left: unknown; top: unknown}>;

      if (typeof parsedValue.left !== 'number' || typeof parsedValue.top !== 'number') {
        return null;
      }

      return {
        left: parsedValue.left,
        top: parsedValue.top,
      };
    } catch {
      return null;
    }
  }

  private writePosition(position: {left: number; top: number}): void {
    try {
      localStorage.setItem(InteractionDebugPanelComponent.POSITION_STORAGE_KEY, JSON.stringify(position));
    } catch {
      // ignore storage write failures in playground.
    }
  }
}

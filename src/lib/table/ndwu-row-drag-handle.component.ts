import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Renderer2,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {CdkDrag, CdkDragHandle, DragDropRegistry} from '@angular/cdk/drag-drop';
import {NDWU_ICON_NAME, NdwuIconComponent, NdwuSizeDirective} from '@ndw-ui-kit/core';
import {NdwuLocalizePipe, NdwuTranslationService} from '@ndw-ui-kit/core/l10n';
import {stopEvent} from '@ndw-ui-kit/core/utils';
import {NdwuRowDragInstructions} from './ndwu-row-drag-instructions';
import type {NdwuTableTranslationTexts} from './ndwu-table.types';

const DEFAULT_ROW_DRAG_HANDLE_TEXTS = {
  reorder: 'Reorder row',
  instructions:
    'Press Space or Enter to grab the row, arrow keys to move it, Space or Enter to drop it, Escape to cancel.',
  grabbed: 'Row grabbed, position {{position}} of {{count}}.',
  moved: 'Row moved to position {{position}} of {{count}}.',
  dropped: 'Row dropped at position {{position}} of {{count}}.',
  cancelled: 'Reorder cancelled, row returned to position {{position}} of {{count}}.',
};

type NdwuRowDragAnnouncement = 'grabbed' | 'moved' | 'dropped' | 'cancelled';

const GRABBED_ROW_CLASS = 'ndwu-row--grabbed';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ndwuRowDragHandle]',
  templateUrl: './ndwu-row-drag-handle.component.html',
  styleUrl: './ndwu-row-drag-handle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkDragHandle, {
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  imports: [NdwuIconComponent, NdwuLocalizePipe],
  host: {
    'type': 'button',
    '[class]': 'rootClass()',
    '[class.ndwu-row-drag-handle--grabbed]': 'grabbed()',
    '[attr.aria-pressed]': 'grabbed()',
    '[attr.aria-describedby]': 'instructions?.id ?? null',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onFocusOut()',
  },
})
export class NdwuRowDragHandleComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly instructions = inject(NdwuRowDragInstructions, {optional: true});

  protected readonly rootClass = computed(() => {
    return `ndwu-row-drag-handle ndwu-row-drag-handle--${this.sizeSvc.effectiveSize()}`;
  });

  public readonly dragTexts = input<NdwuTableTranslationTexts['rowDragHandle']>();

  protected readonly effectiveTexts = computed(() => {
    return {
      ...DEFAULT_ROW_DRAG_HANDLE_TEXTS,
      ...this.dragTexts(),
    };
  });

  protected readonly grabbed = signal(false);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);
  private readonly registry = inject(DragDropRegistry);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly translation = inject(NdwuTranslationService);

  private startIndex = 0;
  private isMoving = false;

  constructor() {
    effect(() => {
      this.instructions?.text.set(this.effectiveTexts().instructions);
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const drag = this.parentDrag();

    if (!drag || drag.disabled) {
      return;
    }

    if (event.key === ' ' || event.key === 'Enter') {
      stopEvent(event);

      if (!event.repeat) {
        this.toggleGrab(drag);
      }

      return;
    }

    if (!this.grabbed()) {
      return;
    }

    if (event.key === 'Escape') {
      stopEvent(event);
      this.setGrabbed(drag, false);
      this.moveTo(drag, this.startIndex, event, 'cancelled');

      return;
    }

    const target = this.targetIndex(drag, event.key);

    if (target !== null) {
      stopEvent(event);
      this.moveTo(drag, target, event, 'moved');
    }
  }

  protected onFocusOut(): void {
    const drag = this.parentDrag();

    if (this.isMoving || !this.grabbed() || !drag) {
      return;
    }

    this.setGrabbed(drag, false);
    this.announce(drag, 'dropped');
  }

  private toggleGrab(drag: CdkDrag): void {
    if (this.grabbed()) {
      this.setGrabbed(drag, false);
      this.announce(drag, 'dropped');

      return;
    }

    this.startIndex = this.indexOf(drag);

    this.setGrabbed(drag, true);
    this.announce(drag, 'grabbed');
  }

  private setGrabbed(drag: CdkDrag, grabbed: boolean): void {
    this.grabbed.set(grabbed);

    if (grabbed) {
      this.renderer.addClass(drag.element.nativeElement, GRABBED_ROW_CLASS);
    } else {
      this.renderer.removeClass(drag.element.nativeElement, GRABBED_ROW_CLASS);
    }
  }

  private targetIndex(drag: CdkDrag, key: string): number | null {
    const index = this.indexOf(drag);

    switch (key) {
      case 'ArrowUp':
        return index - 1;
      case 'ArrowDown':
        return index + 1;
      case 'Home':
        return 0;
      case 'End':
        return drag.dropContainer.getSortedItems().length - 1;
      default:
        return null;
    }
  }

  private moveTo(drag: CdkDrag, index: number, event: KeyboardEvent, announcement: NdwuRowDragAnnouncement): void {
    const list = drag.dropContainer;
    const from = this.indexOf(drag);
    const to = Math.min(list.getSortedItems().length - 1, Math.max(0, index));

    if (from === to) {
      this.announce(drag, announcement);

      return;
    }

    this.isMoving = true;

    list.dropped.emit({
      previousIndex: from,
      currentIndex: to,
      item: drag,
      container: list,
      previousContainer: list,
      isPointerOverContainer: true,
      /* eslint-disable id-denylist -- CDK CdkDragDrop point API uses x/y */
      distance: {x: 0, y: 0},
      dropPoint: {x: 0, y: 0},
      /* eslint-enable id-denylist */
      event: event as unknown as MouseEvent,
    });

    afterNextRender(
      () => {
        this.isMoving = false;
        this.el.nativeElement.focus();
        this.announce(drag, announcement);
      },
      {injector: this.injector},
    );
  }

  private announce(drag: CdkDrag, announcement: NdwuRowDragAnnouncement): void {
    const message = this.translation.instant(this.effectiveTexts()[announcement], {
      position: this.indexOf(drag) + 1,
      count: drag.dropContainer.getSortedItems().length,
    });

    void this.announcer.announce(message);
  }

  private indexOf(drag: CdkDrag): number {
    return drag.dropContainer.getSortedItems().indexOf(drag);
  }

  private parentDrag(): CdkDrag | null {
    const row = this.el.nativeElement.closest('.ndwu-row-draggable');
    const drag = row ? this.registry.getDragDirectiveForNode(row) : null;

    return drag?.dropContainer ? drag : null;
  }
}

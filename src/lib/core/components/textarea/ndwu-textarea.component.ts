import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuResizeObserverDirective, NdwuSizeDirective} from '../../directives';
import {NDWU_ICON_NAME} from '../../../icon-names';
import {NDWU_CONTROL, type NdwuControl} from '../form-field/control/ndwu-control';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {NDWU_INTERACTION_FOCUS_TYPE, NdwuInteractionRegistry} from '../interaction';
import {type NdwuTextareaResizeStart} from './ndwu-textarea.types';

@Component({
  selector: 'ndwu-textarea',
  templateUrl: './ndwu-textarea.component.html',
  styleUrl: './ndwu-textarea.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuIconComponent,
    NdwuResizeObserverDirective,
  ],
  providers: [{
    provide: NDWU_CONTROL,
    useFactory: (): NdwuControl => {
      const textarea = inject(NdwuTextareaComponent);

      return {
        get id(): string {
          return textarea.controlId();
        },
        get empty(): boolean {
          return !textarea.currentValue();
        },
        get disabled(): boolean {
          return textarea.disabled();
        },
        focused: textarea.focused,
        readonly: textarea.readonly,
        shouldLabelFloat: true,
      };
    },
  }],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  host: {
    '[class]': 'hostClass()',
  },
})
export class NdwuTextareaComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly registry = inject(NdwuInteractionRegistry);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly ICON_NAME = NDWU_ICON_NAME;

  public readonly value = input<string>('');
  public readonly id = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly ariaLabel = input<string>('');
  public readonly ariaDescribedby = input<string | null>(null);
  public readonly required = input(false, {transform: booleanAttribute});
  public readonly disabled = input(false, {transform: booleanAttribute});
  public readonly readonly = input(false, {transform: booleanAttribute});
  public readonly invalid = input(false, {transform: booleanAttribute});
  public readonly resizable = input(true, {transform: booleanAttribute});
  public readonly showLineNumbers = input(false, {transform: booleanAttribute});

  public readonly valueChange = output<string>();
  public readonly blurred = output<void>();

  public readonly focused = signal<boolean>(false);
  public readonly currentValue = linkedSignal(() => this.value());

  protected readonly generatedId = uniqueId('ndwu-textarea-');

  public readonly controlId = computed(() => this.id() || this.generatedId);
  protected readonly scrollTop = signal<number>(0);
  protected readonly height = signal<number | null>(null);
  protected readonly scrollbarWidth = signal<number>(0);
  protected readonly scrollbarHeight = signal<number>(0);

  protected readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  protected readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');
  protected readonly actionsSlot = viewChild.required('actionsSlot', {read: NdwuResizeObserverDirective});

  protected readonly hasActions = computed(() => this.actionsSlot().width() > 0);

  protected readonly hostClass = computed(() => {
    return `ndwu-textarea ndwu-textarea--${this.sizeSvc.effectiveSize()}`;
  });

  protected readonly scrollbarOffsetX = computed(() => `${this.scrollbarWidth()}px`);
  protected readonly scrollbarOffsetY = computed(() => `${this.scrollbarHeight()}px`);
  protected readonly actionsWidth = computed(() => `${this.actionsSlot().width()}px`);
  protected readonly actionsHeight = computed(() => `${this.actionsSlot().height()}px`);

  protected readonly lineNumbers = computed(() => {
    const lineCount = this.currentValue().split('\n').length;

    return Array.from({length: lineCount}, (_, index) => index + 1);
  });

  protected readonly syncFocusedWithRegistry = effect(() => {
    this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.INPUT, this.controlId(), this.focused());
  });

  protected readonly syncWheelListener = effect((onCleanup) => {
    if (!this.showLineNumbers()) {
      return;
    }

    const el = this.textarea().nativeElement;
    const listener = (event: WheelEvent): void => this.onWheel(event);

    el.addEventListener('wheel', listener, {passive: false});
    onCleanup(() => el.removeEventListener('wheel', listener));
  });

  private resizeStart: NdwuTextareaResizeStart | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.INPUT, this.controlId(), false);
    });
  }

  public focus(): void {
    this.textarea().nativeElement.focus();
  }

  protected onInput(event: Event): void {
    const {value} = event.target as HTMLTextAreaElement;

    this.currentValue.set(value);
    this.valueChange.emit(value);
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.blurred.emit();
  }

  protected onScroll(): void {
    this.scrollTop.set(this.textarea().nativeElement.scrollTop);
  }

  protected onTextareaResize(): void {
    const {offsetWidth, clientWidth, offsetHeight, clientHeight} = this.textarea().nativeElement;

    this.scrollbarWidth.set(offsetWidth - clientWidth);
    this.scrollbarHeight.set(offsetHeight - clientHeight);
  }

  protected onResizeStart(event: PointerEvent): void {
    if (event.button !== 0 || this.disabled()) {
      return;
    }

    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);

    this.resizeStart = {
      pointerY: event.clientY,
      height: this.box().nativeElement.getBoundingClientRect().height,
    };
  }

  protected onResizeMove(event: PointerEvent): void {
    if (!this.resizeStart) {
      return;
    }

    this.height.set(Math.max(0, this.resizeStart.height + event.clientY - this.resizeStart.pointerY));
  }

  protected onResizeEnd(): void {
    this.resizeStart = null;
  }

  private onWheel(event: WheelEvent): void {
    if (event.ctrlKey) {
      return;
    }

    const el = this.textarea().nativeElement;
    const unit = this.wheelDeltaUnit(event.deltaMode, el);
    const swapAxes = event.shiftKey && !event.deltaX;
    const deltaX = (swapAxes ? event.deltaY : event.deltaX) * unit;
    const deltaY = (swapAxes ? 0 : event.deltaY) * unit;
    const {scrollTop, scrollLeft} = el;

    el.scrollTop = scrollTop + deltaY;
    el.scrollLeft = scrollLeft + deltaX;

    if (el.scrollTop === scrollTop && el.scrollLeft === scrollLeft) {
      return;
    }

    event.preventDefault();
    this.scrollTop.set(el.scrollTop);
  }

  private wheelDeltaUnit(deltaMode: number, el: HTMLTextAreaElement): number {
    if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
      return parseFloat(getComputedStyle(el).lineHeight) || 16;
    }

    if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      return el.clientHeight;
    }

    return 1;
  }
}

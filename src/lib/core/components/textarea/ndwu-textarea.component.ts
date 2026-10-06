import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
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
import {NDWU_SIZE, type NdwuSize} from '../../../shared.types';
import {NDWU_CONTROL, type NdwuControl} from '../form-field/control/ndwu-control';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {NDWU_INTERACTION_FOCUS_TYPE, NdwuInteractionRegistry} from '../interaction';
import {NdwuScrollbarComponent} from '../scrollbar/ndwu-scrollbar.component';
import {type NdwuTextareaResizeStart} from './ndwu-textarea.types';

@Component({
  selector: 'ndwu-textarea',
  templateUrl: './ndwu-textarea.component.html',
  styleUrl: './ndwu-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocalizePipe,
    NdwuIconComponent,
    NdwuResizeObserverDirective,
    NdwuScrollbarComponent,
  ],
  providers: [{
    provide: NDWU_CONTROL,
    useExisting: forwardRef(() => NdwuTextareaComponent),
  }],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  host: {
    '[class]': 'hostClass()',
  },
})
export class NdwuTextareaComponent implements NdwuControl {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly registry = inject(NdwuInteractionRegistry);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly ICON_NAME = NDWU_ICON_NAME;

  public readonly value = input<string>('');
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly idInput = input<string>('', {alias: 'id'});
  public readonly placeholder = input<string>('');
  public readonly ariaLabel = input<string>('');
  public readonly ariaDescribedby = input<string | null>(null);
  public readonly required = input(false, {transform: booleanAttribute});
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly disabledInput = input(false, {alias: 'disabled', transform: booleanAttribute});
  public readonly readonly = input(false, {transform: booleanAttribute});
  public readonly invalid = input(false, {transform: booleanAttribute});
  public readonly resizable = input(true, {transform: booleanAttribute});
  public readonly showLineNumbers = input(false, {transform: booleanAttribute});

  public readonly valueChange = output<string>();
  public readonly blurred = output<void>();

  public readonly focused = signal<boolean>(false);
  public readonly currentValue = linkedSignal(() => this.value());
  public readonly shouldLabelFloat = true;

  protected readonly generatedId = uniqueId('ndwu-textarea-');

  protected readonly height = linkedSignal({
    source: () => ({size: this.sizeSvc.effectiveSize(), resizable: this.resizable()}),
    computation: (): number | null => null,
  });

  protected readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  protected readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');
  protected readonly scrollbar = viewChild.required(NdwuScrollbarComponent);
  protected readonly actionsSlot = viewChild.required('actionsSlot', {read: NdwuResizeObserverDirective});

  protected readonly hasActions = computed(() => this.actionsSlot().width() > 0);

  protected readonly hostClass = computed(() => {
    return `ndwu-textarea ndwu-textarea--${this.sizeSvc.effectiveSize()}`;
  });

  protected readonly scrollbarSize = computed<NdwuSize>(() => {
    return this.sizeSvc.effectiveSize() === NDWU_SIZE.L ? NDWU_SIZE.L : NDWU_SIZE.XL;
  });

  protected readonly actionsWidth = computed(() => `${this.actionsSlot().width()}px`);
  protected readonly actionsHeight = computed(() => `${this.actionsSlot().height()}px`);

  protected readonly lineNumbers = computed(() => {
    const lineCount = this.currentValue().split('\n').length;

    return Array.from({length: lineCount}, (_, index) => index + 1);
  });

  protected readonly syncFocusedWithRegistry = effect(() => {
    this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.INPUT, this.id, this.focused());
  });

  protected readonly refreshScrollbarOnValueChange = afterRenderEffect(() => {
    this.currentValue();
    this.scrollbar().refresh();
  });

  private resizeStart: NdwuTextareaResizeStart | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.INPUT, this.id, false);
    });
  }

  public get id(): string {
    return this.idInput() || this.generatedId;
  }

  public get disabled(): boolean {
    return this.disabledInput();
  }

  public get empty(): boolean {
    return !this.currentValue();
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

  protected onResizeStart(event: PointerEvent): void {
    if (event.button !== 0 || this.disabled) {
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

    const clampedHeight = Math.max(0, this.resizeStart.height + event.clientY - this.resizeStart.pointerY);

    this.height.set(clampedHeight);
  }

  protected onResizeEnd(): void {
    this.resizeStart = null;
  }
}

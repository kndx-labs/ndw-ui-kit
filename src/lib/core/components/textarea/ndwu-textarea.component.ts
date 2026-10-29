import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  type Signal,
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
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuResizeObserverDirective, NdwuSizeDirective} from '../../directives';
import {NDWU_ICON_NAME} from '../../../icon-names';
import {NDWU_SIZE, type NdwuSize} from '../../../shared.types';
import {NDWU_CONTROL, type NdwuControl} from '../form-field/control/ndwu-control';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {NDWU_INTERACTION_FOCUS_TYPE, NdwuInteractionRegistry} from '../interaction';
import {NdwuScrollbarComponent} from '../scrollbar/ndwu-scrollbar.component';
import {NdwuSpokesLoaderComponent} from '../spokes-loader/ndwu-spokes-loader.component';
import {
  type NdwuTextareaResizeConfiguration,
  type NdwuTextareaResizeDirection,
  type NdwuTextareaResizeStart,
} from './ndwu-textarea.types';

const HORIZONTAL_RESIZE_THRESHOLD_PX = 3;

function parsePixelValue(value: string): number | null {
  if (!/^\+?(?:\d+(?:\.\d*)?|\.\d+)px$/.test(value)) {
    return null;
  }

  const parsed = Number(value.slice(0, -2));

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function sameResizeConfiguration(
  left: NdwuTextareaResizeConfiguration,
  right: NdwuTextareaResizeConfiguration,
): boolean {
  return left.size === right.size
    && left.resizable === right.resizable
    && left.resizeDirection === right.resizeDirection;
}

@Component({
  selector: 'ndwu-textarea',
  templateUrl: './ndwu-textarea.component.html',
  styleUrl: './ndwu-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuLocalizePipe,
    NdwuIconComponent,
    NdwuResizeObserverDirective,
    NdwuScrollbarComponent,
    NdwuSpokesLoaderComponent,
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
  public readonly loading = input(false, {transform: booleanAttribute});
  public readonly loadingLabel = input<string>('');
  public readonly resizable = input(true, {transform: booleanAttribute});
  public readonly resizeDirection = input<NdwuTextareaResizeDirection>('both');
  public readonly showLineNumbers = input(false, {transform: booleanAttribute});

  public readonly valueChange = output<string>();
  public readonly blurred = output<void>();

  public readonly focused = signal<boolean>(false);
  public readonly currentValue = linkedSignal(() => this.value());
  public readonly shouldLabelFloat = true;
  private readonly preferredWidthState = linkedSignal({
    source: () => ({
      size: this.sizeSvc.effectiveSize(),
      resizable: this.resizable(),
      resizeDirection: this.resizeDirection(),
    }),
    computation: (): number | null => null,
  });
  public readonly preferredWidth: Signal<number | null> = this.preferredWidthState;

  protected readonly generatedId = uniqueId('ndwu-textarea-');

  protected readonly height = linkedSignal({
    source: () => ({
      size: this.sizeSvc.effectiveSize(),
      resizable: this.resizable(),
      resizeDirection: this.resizeDirection(),
    }),
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
  protected readonly endResizeOnConfigurationChange = effect(() => {
    this.sizeSvc.effectiveSize();
    this.resizable();
    this.resizeDirection();
    this.onResizeEnd();
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.onResizeEnd();
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

  public setValue(value: string): void {
    this.currentValue.set(value);

    const element = this.textarea().nativeElement;

    if (element.value !== value) {
      element.value = value;
    }
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
    if (event.button !== 0 || this.disabled || !this.resizable()) {
      return;
    }

    this.onResizeEnd();
    event.preventDefault();

    const captureTarget = event.currentTarget as HTMLElement;
    const box = this.box().nativeElement;
    const rect = box.getBoundingClientRect();
    const rawMinWidth = getComputedStyle(box)
      .getPropertyValue('--ndwu-textarea-min-width')
      .trim();
    const minWidth = parsePixelValue(rawMinWidth);
    const configuration: NdwuTextareaResizeConfiguration = {
      size: this.sizeSvc.effectiveSize(),
      resizable: this.resizable(),
      resizeDirection: this.resizeDirection(),
    };

    captureTarget.setPointerCapture(event.pointerId);

    this.resizeStart = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      width: rect.width,
      height: rect.height,
      minWidth,
      horizontalActivated: false,
      pointerId: event.pointerId,
      captureTarget,
      configuration,
    };
  }

  protected onResizeMove(event: PointerEvent): void {
    const resizeStart = this.resizeStart;

    if (event.pointerId !== resizeStart?.pointerId) {
      return;
    }

    if (!sameResizeConfiguration(resizeStart.configuration, this.getResizeConfiguration())) {
      this.onResizeEnd();

      return;
    }

    const dx = event.clientX - resizeStart.pointerX;
    const dy = event.clientY - resizeStart.pointerY;
    const {resizeDirection} = resizeStart.configuration;

    if (resizeDirection !== 'vertical' && resizeStart.minWidth !== null) {
      resizeStart.horizontalActivated ||= Math.abs(dx) >= HORIZONTAL_RESIZE_THRESHOLD_PX;

      if (resizeStart.horizontalActivated) {
        this.preferredWidthState.set(Math.max(resizeStart.minWidth, resizeStart.width + dx));
      }
    }

    if (resizeDirection !== 'horizontal') {
      this.height.set(Math.max(0, resizeStart.height + dy));
    }
  }

  protected onResizeEnd(event?: PointerEvent): void {
    const resizeStart = this.resizeStart;

    if (!resizeStart || (event && event.pointerId !== resizeStart.pointerId)) {
      return;
    }

    this.resizeStart = null;

    if (resizeStart.captureTarget.hasPointerCapture(resizeStart.pointerId)) {
      resizeStart.captureTarget.releasePointerCapture(resizeStart.pointerId);
    }
  }

  private getResizeConfiguration(): NdwuTextareaResizeConfiguration {
    return {
      size: this.sizeSvc.effectiveSize(),
      resizable: this.resizable(),
      resizeDirection: this.resizeDirection(),
    };
  }
}

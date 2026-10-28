import {
  Directive,
  ElementRef,
  OnChanges,
  Renderer2,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
  isDevMode,
  signal,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {CdkDropList} from '@angular/cdk/drag-drop';
import {NdwuTranslationService} from '@ndw-ui-kit/core/l10n';
import {NdwuRowDragInstructions} from './ndwu-row-drag-instructions';
import {NdwuSortDirective} from './ndwu-sort.directive';

/** Only reports the move; the host reorders its data. Always off on a table with `ndwuSort`. */
@Directive({
  selector: '[ndwuRowDrag]',
  hostDirectives: [{
    directive: CdkDropList,
    outputs: ['cdkDropListDropped: ndwuRowDrop'],
  }],
  providers: [NdwuRowDragInstructions],
  host: {
    class: 'ndwu-row-drag-list',
  },
})
export class NdwuRowDragDirective implements OnChanges {
  private readonly dropList = inject(CdkDropList);
  private readonly hasSort = inject(NdwuSortDirective, {optional: true}) !== null;
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly translation = inject(NdwuTranslationService);
  private readonly instructions = inject(NdwuRowDragInstructions);
  private readonly langChange = toSignal(this.translation.onLangChange$, {equal: () => false});
  private readonly instructionsElement = signal<HTMLElement | null>(null);

  public readonly ndwuRowDragDisabled = input(false, {transform: booleanAttribute});

  constructor() {
    if (this.hasSort && isDevMode()) {
      console.warn(
        '[ndw-ui-kit] ndwuRowDrag: the table also has ndwuSort. Row drag is disabled, use one or the other.',
      );
    }

    this.syncDisabled();

    afterNextRender(() => {
      const span = this.renderer.createElement('span') as HTMLElement;

      this.renderer.setAttribute(span, 'hidden', '');
      this.renderer.setAttribute(span, 'id', this.instructions.id);
      this.renderer.appendChild(this.el.nativeElement, span);
      this.instructionsElement.set(span);
    });

    effect(() => {
      const span = this.instructionsElement();
      const text = this.instructions.text();

      this.langChange();

      if (span && text !== null) {
        this.renderer.setProperty(span, 'textContent', this.translation.instant(text));
      }
    });
  }

  public ngOnChanges(): void {
    this.syncDisabled();
  }

  private syncDisabled(): void {
    this.dropList.disabled = this.hasSort || this.ndwuRowDragDisabled();
  }
}

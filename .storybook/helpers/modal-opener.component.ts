import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
  output,
} from '@angular/core';
import {NdwuButtonComponent, NdwuModalRef, NdwuModalService, NdwuModalTemplateContext} from '@ndw-ui-kit/core';

export interface SbModalOpenContext {
  readonly modal: NdwuModalService;
  readonly injector: Injector;
  readonly viewContainerRef: ViewContainerRef;
  readonly template: TemplateRef<NdwuModalTemplateContext> | null;
}

export type SbModalRef = Pick<NdwuModalRef<unknown>, 'afterClosed$' | 'close'>;

export type SbModalOpenFn = (context: SbModalOpenContext) => SbModalRef;

@Component({
  selector: 'sb-modal-opener',
  template: '<button ndwu-button variant="secondary" [label]="label()" (click)="openModal()"></button>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuButtonComponent],
})
export class SbModalOpenerComponent {
  public readonly label = input.required<string>();
  public readonly open = input.required<SbModalOpenFn>();
  public readonly template = input<TemplateRef<NdwuModalTemplateContext> | null>(null);
  public readonly closed = output<unknown>();

  private readonly modal = inject(NdwuModalService);
  private readonly injector = inject(Injector);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly openRefs = new Set<SbModalRef>();
  private isDestroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.isDestroyed = true;
      this.openRefs.forEach((ref) => ref.close());
    });
  }

  protected openModal(): void {
    const ref = this.open()({
      modal: this.modal,
      injector: this.injector,
      viewContainerRef: this.viewContainerRef,
      template: this.template(),
    });

    this.openRefs.add(ref);

    ref.afterClosed$
      .subscribe((result) => {
        this.openRefs.delete(ref);

        if (!this.isDestroyed) {
          this.closed.emit(result);
        }
      });
  }
}

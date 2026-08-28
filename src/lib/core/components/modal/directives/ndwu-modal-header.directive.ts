import {Directive, HostBinding, OnDestroy, OnInit, TemplateRef, ViewContainerRef, inject} from '@angular/core';
import {NDWU_MODAL_CSS_CLASS} from '../ndwu-modal.constants';
import {NDWU_MODAL_SLOT_REGISTRY} from '../ndwu-modal-slot-registry';

@Directive({
  selector: '[ndwuModalHeader]',
})
export class NdwuModalHeaderDirective implements OnInit, OnDestroy {
  private readonly templateRef = inject(TemplateRef<unknown>, {optional: true});
  private readonly slotRegistry = inject(NDWU_MODAL_SLOT_REGISTRY, {optional: true});
  private readonly viewContainerRef = inject(ViewContainerRef);

  @HostBinding(`class.${NDWU_MODAL_CSS_CLASS}__header`)
  protected get headerClass(): boolean {
    return this.templateRef === null;
  }

  public ngOnInit(): void {
    if (this.templateRef && this.slotRegistry) {
      this.slotRegistry.register('header', this.templateRef);

      return;
    }

    if (this.templateRef) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }

  public ngOnDestroy(): void {
    if (this.templateRef && this.slotRegistry) {
      this.slotRegistry.unregister('header', this.templateRef);
    }
  }
}

import {InjectionToken, TemplateRef, WritableSignal, signal} from '@angular/core';

export type NdwuModalSlotName =
  | 'header'
  | 'footer';

export class NdwuModalSlotRegistry {
  public readonly headerTemplate = signal<TemplateRef<unknown> | null>(null);
  public readonly footerTemplate = signal<TemplateRef<unknown> | null>(null);

  public register(slot: NdwuModalSlotName, template: TemplateRef<unknown>): void {
    this.getSlotSignal(slot).set(template);
  }

  public unregister(slot: NdwuModalSlotName, template: TemplateRef<unknown>): void {
    const slotSignal = this.getSlotSignal(slot);

    if (slotSignal() === template) {
      slotSignal.set(null);
    }
  }

  private getSlotSignal(slot: NdwuModalSlotName): WritableSignal<TemplateRef<unknown> | null> {
    return slot === 'header'
      ? this.headerTemplate
      : this.footerTemplate;
  }
}

export const NDWU_MODAL_SLOT_REGISTRY = new InjectionToken<NdwuModalSlotRegistry>('NDWU_MODAL_SLOT_REGISTRY');

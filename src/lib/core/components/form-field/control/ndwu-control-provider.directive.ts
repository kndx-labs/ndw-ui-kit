import {Directive, computed, input} from '@angular/core';
import {NDWU_CONTROL, type NdwuControl} from './ndwu-control';

/**
 * Places the `NDWU_CONTROL` token on a content-child element by delegating
 * to a bound `NdwuControl` instance. Use when the control implementation
 * lives on an ancestor component but the token must be discoverable via
 * `contentChild(NDWU_CONTROL)` inside `<ndwu-form-field>`.
 *
 * Usage: `<div [ndwuControlProvider]="this" ...>` where `this` implements NdwuControl.
 */
@Directive({
  selector: '[ndwuControlProvider]',
  standalone: true,
  providers: [
    {
      provide: NDWU_CONTROL,
      useExisting: NdwuControlProviderDirective,
    },
  ],
})
export class NdwuControlProviderDirective implements NdwuControl {
  public readonly ndwuControlProvider = input.required<NdwuControl>();

  public get id(): string {
    return this.ndwuControlProvider().id;
  }

  public readonly focused = computed(() => this.ndwuControlProvider().focused());

  public get empty(): boolean {
    return this.ndwuControlProvider().empty;
  }

  public get disabled(): boolean {
    return this.ndwuControlProvider().disabled;
  }

  public get hasPlaceholder(): boolean {
    return this.ndwuControlProvider().hasPlaceholder ?? false;
  }

  public get shouldLabelFloat(): boolean {
    return this.ndwuControlProvider().shouldLabelFloat ?? false;
  }
}

import {Directive, TemplateRef, inject, input} from '@angular/core';
import type {NdwuHeatStripCell, NdwuHeatStripMarkerContext, NdwuHeatStripTooltipContext} from './ndwu-heat-strip.types';

@Directive({
  selector: 'ng-template[ndwuHeatStripTooltip]',
})
export class NdwuHeatStripTooltipDirective<T = unknown> {
  public readonly ndwuHeatStripTooltip = input.required<readonly NdwuHeatStripCell<T>[]>();
  public readonly templateRef = inject<TemplateRef<NdwuHeatStripTooltipContext<T>>>(TemplateRef);

  public static ngTemplateContextGuard<T>(
    _directive: NdwuHeatStripTooltipDirective<T>,
    _context: unknown,
  ): _context is NdwuHeatStripTooltipContext<T> {
    return true;
  }
}

@Directive({
  selector: 'ng-template[ndwuHeatStripMarker]',
})
export class NdwuHeatStripMarkerDirective<T = unknown> {
  public readonly ndwuHeatStripMarker = input.required<readonly NdwuHeatStripCell<T>[]>();
  public readonly templateRef = inject<TemplateRef<NdwuHeatStripMarkerContext<T>>>(TemplateRef);

  public static ngTemplateContextGuard<T>(
    _directive: NdwuHeatStripMarkerDirective<T>,
    _context: unknown,
  ): _context is NdwuHeatStripMarkerContext<T> {
    return true;
  }
}

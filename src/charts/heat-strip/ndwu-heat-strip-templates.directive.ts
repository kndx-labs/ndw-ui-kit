import {Directive, TemplateRef, inject, input} from '@angular/core';
import type {NdwuHeatStripCell, NdwuHeatStripMarkerContext, NdwuHeatStripTooltipContext} from './ndwu-heat-strip.types';

@Directive({
  selector: 'ng-template[ndwuHeatStripTooltip]',
})
export class NdwuHeatStripTooltipDirective<T = unknown> {
  /** Used only to infer the template context type; the value is unused at runtime. */
  public readonly ndwuHeatStripTooltip = input<readonly NdwuHeatStripCell<T>[] | '' | undefined>(undefined);
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
  /** Used only to infer the template context type; the value is unused at runtime. */
  public readonly ndwuHeatStripMarker = input<readonly NdwuHeatStripCell<T>[] | '' | undefined>(undefined);
  public readonly templateRef = inject<TemplateRef<NdwuHeatStripMarkerContext<T>>>(TemplateRef);

  public static ngTemplateContextGuard<T>(
    _directive: NdwuHeatStripMarkerDirective<T>,
    _context: unknown,
  ): _context is NdwuHeatStripMarkerContext<T> {
    return true;
  }
}

import {Directive, TemplateRef, inject, input} from '@angular/core';
import type {NdwuOption} from '../../../shared.types';

export interface NdwuOptionTemplateContext<T = NdwuOption> {
  $implicit: NdwuOption;
  raw: T | undefined;
  label: string;
  selected: boolean;
  disabled: boolean;
  /** Current input text; set only by autocomplete. */
  query?: string;
}

@Directive({
  selector: 'ng-template[ndwuOptionTemplate]',
})
export class NdwuOptionTemplateDirective<T = NdwuOption> {
  /** Required. Used only to infer the template context type; the value is unused at runtime. */
  public readonly ndwuOptionTemplate = input.required<readonly T[]>();
  public readonly templateRef = inject<TemplateRef<NdwuOptionTemplateContext<T>>>(TemplateRef);

  public static ngTemplateContextGuard<T>(
    _directive: NdwuOptionTemplateDirective<T>,
    _context: unknown,
  ): _context is NdwuOptionTemplateContext<T> {
    return true;
  }
}

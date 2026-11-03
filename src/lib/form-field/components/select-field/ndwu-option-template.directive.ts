import {Directive, TemplateRef, inject, input} from '@angular/core';
import type {NdwuOption} from '@ndw-ui-kit/core';

export interface NdwuOptionTemplateContext<T = NdwuOption> {
  $implicit: NdwuOption;
  raw: T | undefined;
  label: string;
  selected: boolean;
  disabled: boolean;
}

@Directive({
  selector: 'ng-template[ndwuOptionTemplate]',
})
export class NdwuOptionTemplateDirective<T = NdwuOption> {
  /** Used only to infer the template context type; the value is unused at runtime. */
  public readonly ndwuOptionTemplate = input<readonly T[] | '' | undefined>(undefined);
  public readonly templateRef = inject<TemplateRef<NdwuOptionTemplateContext<T>>>(TemplateRef);

  public static ngTemplateContextGuard<T>(
    _directive: NdwuOptionTemplateDirective<T>,
    _context: unknown,
  ): _context is NdwuOptionTemplateContext<T> {
    return true;
  }
}

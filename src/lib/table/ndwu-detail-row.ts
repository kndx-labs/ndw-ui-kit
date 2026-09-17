import {
  Component,
  Directive,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  TemplateRef,
  inject,
} from '@angular/core';

@Directive({
  selector: '[ndwuDetailRowDef]',
})
export class NdwuDetailRowDef<T> {
  readonly template = inject(TemplateRef<{$implicit: T}>);

  @Input('ndwuDetailRowDefWhen') when: ((row: T) => boolean) | null = null;
}

@Component({
  selector: 'ndwu-detail-row',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ndwu-detail-row',
    'role': 'row',
  },
})
export class NdwuDetailRow {}

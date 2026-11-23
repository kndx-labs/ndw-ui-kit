import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {NdwuButtonComponent} from '@ndw-ui-kit/core';

const FIELD_STEP = 3;

@Component({
  selector: 'sb-modal-growing',
  templateUrl: './modal-growing.component.html',
  styleUrl: './modal-growing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuButtonComponent],
})
export class SbModalGrowingComponent {
  protected readonly fields = signal<number[]>([]);

  protected addFields(): void {
    this.fields.update((fields) => {
      const start = fields.length + 1;
      const added = Array.from({length: FIELD_STEP}, (_, index) => start + index);

      return [...fields, ...added];
    });
  }

  protected removeFields(): void {
    this.fields.update((fields) => fields.slice(0, Math.max(0, fields.length - FIELD_STEP)));
  }
}

import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {NdwuButtonComponent} from '@ndw-ui-kit/core';

const FIELD_STEP = 3;

@Component({
  selector: 'app-growing-dialog',
  templateUrl: './growing-dialog.component.html',
  styleUrl: './growing-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
  ],
})
export class GrowingDialogComponent {
  protected readonly fields = signal<number[]>([]);

  protected addFields(): void {
    this.fields.update(fields => {
      const start = fields.length + 1;
      const added = Array.from({length: FIELD_STEP}, (_, index) => {
        return start + index;
      });

      return [...fields, ...added];
    });
  }

  protected removeFields(): void {
    this.fields.update(fields => {
      return fields.slice(0, Math.max(0, fields.length - FIELD_STEP));
    });
  }
}

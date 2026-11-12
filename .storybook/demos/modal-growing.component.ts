import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {NdwuButtonComponent} from '@ndw-ui-kit/core';

const FIELD_STEP = 3;

@Component({
  selector: 'sb-modal-growing',
  template: `
    <p class="hint">
      The dialog has no fixed height: it grows with the content up to its max height, then the body scrolls.
      Removing fields shrinks it back.
    </p>

    <div class="actions">
      <button ndwu-button variant="secondary" label="Add fields" (click)="addFields()"></button>
      <button
        ndwu-button
        variant="tertiary"
        label="Remove fields"
        [disabled]="fields().length === 0"
        (click)="removeFields()"
      ></button>
    </div>

    @if (fields().length > 0) {
      <div class="fields">
        @for (field of fields(); track field) {
          <p class="field">Extra field {{ field }}</p>
        }
      </div>
    }
  `,
  styles: `
    .hint {
      margin: 0 0 16px;
      color: var(--ndwu-color-gray-80);
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: 12px;
    }

    .fields {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }

    .field {
      margin: 0;
      padding: 12px;
      border: 1px dashed var(--ndwu-color-gray-30);
    }
  `,
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

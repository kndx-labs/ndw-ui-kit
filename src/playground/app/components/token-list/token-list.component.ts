import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

export interface TokenListItem {
  readonly cssVar: string;
  readonly key: string;
}

@Component({
  selector: 'app-token-list',
  templateUrl: './token-list.component.html',
  styleUrl: './token-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class TokenListComponent {
  public readonly tokens = input.required<readonly TokenListItem[]>();
  public readonly formGroup = input.required<FormGroup>();
  public readonly tokenPickerValues = input<Record<string, string>>({});
  public readonly inheritLabel = input<string>('');
  public readonly sectionTitle = input<string>('');
}

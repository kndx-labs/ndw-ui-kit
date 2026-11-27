import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'sb-modal-long-text',
  templateUrl: './modal-long-text.component.html',
  styleUrl: './modal-long-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbModalLongTextComponent {}

import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {NdwuToggleComponent} from '@ndw-ui-kit/core';
import {PlaygroundDebugService} from '@app/services/playground-debug.service';

@Component({
  selector: 'app-debug-settings-dialog',
  templateUrl: './debug-settings-dialog.component.html',
  styleUrl: './debug-settings-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuToggleComponent],
})
export class DebugSettingsDialogComponent {
  protected readonly debugService = inject(PlaygroundDebugService);
}

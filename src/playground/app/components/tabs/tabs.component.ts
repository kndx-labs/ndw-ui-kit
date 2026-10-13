import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';

export interface Tab {
  id: string;
  label: string;
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuLocalizePipe,
  ],
})
export class TabsComponent {
  public readonly tabs = input.required<readonly Tab[]>();
  public readonly activeTabId = input.required<string>();
  public readonly tabChange = output<string>();

  public selectTab(id: string): void {
    this.tabChange.emit(id);
  }
}

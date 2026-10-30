import {ChangeDetectionStrategy, Component, booleanAttribute, computed, contentChildren, input} from '@angular/core';
import {NdwuScrollbarComponent} from '../scrollbar/ndwu-scrollbar.component';
import {NdwuPanelFooterDirective} from './ndwu-panel-footer.directive';
import {NdwuPanelHeaderDirective} from './ndwu-panel-header.directive';

const DROPDOWN_WIDTH_THRESHOLD = 640; // @see internal design spec: dropdown width threshold

@Component({
  selector: 'ndwu-dropdown-panel',
  templateUrl: './ndwu-dropdown-panel.component.html',
  styleUrl: './ndwu-dropdown-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuScrollbarComponent,
  ],
})
export class NdwuDropdownPanelComponent {
  public readonly sheet = input(false, {transform: booleanAttribute});
  public readonly triggerWidth = input<number | undefined>(undefined);

  protected readonly minWidth = computed(() => {
    const triggerWidth = Number(this.triggerWidth());

    if (!isNaN(triggerWidth)) {
      return triggerWidth;
    }

    return undefined;
  });

  protected readonly maxWidth = computed(() => {
    const triggerWidth = Number(this.triggerWidth());

    if (isNaN(triggerWidth)) {
      return DROPDOWN_WIDTH_THRESHOLD;
    }

    return triggerWidth > DROPDOWN_WIDTH_THRESHOLD ? triggerWidth : DROPDOWN_WIDTH_THRESHOLD;
  });

  protected headerDirectives = contentChildren(NdwuPanelHeaderDirective);
  protected hasHeader = computed(() => this.headerDirectives().length > 0);

  protected footerDirectives = contentChildren(NdwuPanelFooterDirective);
  protected hasFooter = computed(() => this.footerDirectives().length > 0);
}

import {ChangeDetectionStrategy, Component, TemplateRef, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NdwuButtonComponent, type NdwuPopoverAlign, NdwuPopoverDirective, type NdwuPopoverSide} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-popover-overview',
  templateUrl: './popover-overview.component.html',
  styleUrl: './popover-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LocalizePipe,
    NdwuButtonComponent,
    NdwuPopoverDirective,
    ShowcaseLayoutComponent,
  ],
})
export class PopoverOverviewComponent {
  protected readonly popoverSides: NdwuPopoverSide[] = ['top', 'right', 'bottom', 'left'];
  protected readonly popoverAligns: NdwuPopoverAlign[] = ['start', 'center', 'end'];

  private readonly richPopoverTpl = viewChild<TemplateRef<unknown>>('richPopoverTpl');

  protected get richContent(): TemplateRef<unknown> | null {
    return this.richPopoverTpl() ?? null;
  }
}

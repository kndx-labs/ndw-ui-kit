import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {
  NdwuAccordionComponent,
  NdwuAccordionContentDirective,
  NdwuAccordionItemComponent,
  NdwuBadgeComponent,
  NdwuCheckboxComponent,
  NdwuToggleComponent,
} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

interface AccordionExampleItem {
  title: string;
  description: string;
  badges: string[];
}

@Component({
  selector: 'app-accordion-overview',
  templateUrl: './accordion-overview.component.html',
  styleUrl: './accordion-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    NdwuAccordionComponent,
    NdwuAccordionContentDirective,
    NdwuAccordionItemComponent,
    NdwuBadgeComponent,
    NdwuCheckboxComponent,
    NdwuToggleComponent,
    LocalizePipe,
    ShowcaseLayoutComponent,
  ],
})
export class AccordionOverviewComponent {
  protected readonly items: readonly AccordionExampleItem[] = [
    {
      title: 'Notifications',
      description: 'Choose which events send you a message and how it is delivered.',
      badges: ['E-mail', 'Push', 'SMS'],
    },
    {
      title: 'Backups',
      description: 'Snapshots are created daily and kept for 30 days.',
      badges: ['Daily'],
    },
    {
      title: 'Access control',
      description: 'Manage who can view and edit shared resources.',
      badges: ['Owner', 'Editor'],
    },
  ];

  protected readonly controlledExpanded = signal(true);
}

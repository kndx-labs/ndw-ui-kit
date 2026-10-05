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
      title: 'Initial setup wizard',
      description:
        'Provides the core wireless functionality. This component will be installed automatically if needed.',
      badges: ['Initial Setup Wizard', 'Wi-Fi System controller', 'WPA Enterprise'],
    },
    {
      title: 'Package manager',
      description: 'Lightweight package management system based upon OPKG.',
      badges: ['OPKG'],
    },
    {
      title: 'VPN server',
      description: 'For access of the VPN server\'s clients to the Internet.',
      badges: ['IPsec', 'WireGuard'],
    },
  ];

  protected readonly controlledExpanded = signal(true);
}

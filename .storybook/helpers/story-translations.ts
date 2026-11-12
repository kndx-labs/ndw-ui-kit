import {NdwuTranslationService} from '@ndw-ui-kit/core/l10n';
import {Decorator, applicationConfig} from '@storybook/angular';
import {NEVER} from 'rxjs';

export const withTranslations = (translations: Readonly<Record<string, string>>): Decorator => {
  const service: NdwuTranslationService = {
    onLangChange$: NEVER,
    instant: (key: string) => translations[key] ?? key,
  };

  return applicationConfig({providers: [{provide: NdwuTranslationService, useValue: service}]});
};

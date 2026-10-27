import {provideNdwuNgxTranslate} from './ndw-ui-kit-ngx-translate.providers';
import {NdwuNgxTranslationService} from './ngx-translation.service';

/** @deprecated Use `NdwuNgxTranslationService` instead. Will be removed in a future minor release. */
export const NgxTranslationService = NdwuNgxTranslationService;
/** @deprecated Use `NdwuNgxTranslationService` instead. Will be removed in a future minor release. */
export type NgxTranslationService = NdwuNgxTranslationService;

/** @deprecated Use `provideNdwuNgxTranslate` instead. Will be removed in a future minor release. */
export const provideNdwUiKitNgxTranslate = provideNdwuNgxTranslate;

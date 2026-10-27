import {NdwuLocalizeHtmlPipe} from './localize-html.pipe';
import {NdwuLocalizeIfPipe} from './localize-if.pipe';
import {NdwuLocalizePipe} from './localize.pipe';
import {provideNdwuNoopTranslation} from './providers/ndw-ui-kit.providers';
import {NdwuNoopTranslationService} from './services/noop-translation.service';
import {NdwuTranslationService} from './services/translation.service';

/** @deprecated Use `NdwuLocalizePipe` instead. Will be removed in a future minor release. */
export const LocalizePipe = NdwuLocalizePipe;
/** @deprecated Use `NdwuLocalizePipe` instead. Will be removed in a future minor release. */
export type LocalizePipe = NdwuLocalizePipe;

/** @deprecated Use `NdwuLocalizeIfPipe` instead. Will be removed in a future minor release. */
export const LocalizeIfPipe = NdwuLocalizeIfPipe;
/** @deprecated Use `NdwuLocalizeIfPipe` instead. Will be removed in a future minor release. */
export type LocalizeIfPipe = NdwuLocalizeIfPipe;

/** @deprecated Use `NdwuLocalizeHtmlPipe` instead. Will be removed in a future minor release. */
export const LocalizeHtmlPipe = NdwuLocalizeHtmlPipe;
/** @deprecated Use `NdwuLocalizeHtmlPipe` instead. Will be removed in a future minor release. */
export type LocalizeHtmlPipe = NdwuLocalizeHtmlPipe;

/** @deprecated Use `NdwuTranslationService` instead. Will be removed in a future minor release. */
export const UiKitTranslationService = NdwuTranslationService;
/** @deprecated Use `NdwuTranslationService` instead. Will be removed in a future minor release. */
export type UiKitTranslationService = NdwuTranslationService;

/** @deprecated Use `NdwuNoopTranslationService` instead. Will be removed in a future minor release. */
export const NoopTranslationService = NdwuNoopTranslationService;
/** @deprecated Use `NdwuNoopTranslationService` instead. Will be removed in a future minor release. */
export type NoopTranslationService = NdwuNoopTranslationService;

/** @deprecated Use `provideNdwuNoopTranslation` instead. Will be removed in a future minor release. */
export const provideNdwUiKitNoopTranslation = provideNdwuNoopTranslation;

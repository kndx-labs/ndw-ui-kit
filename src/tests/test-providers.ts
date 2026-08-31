import {Provider} from '@angular/core';
import {provideNdwUiKitNoopTranslation} from '@ndw-ui-kit/core/l10n';

const providers: Provider[] = [
  ...provideNdwUiKitNoopTranslation(),
];

export default providers;

import {Pipe, type PipeTransform} from '@angular/core';
import {NdwuLocalizePipe} from './localize.pipe';

@Pipe({
  name: 'localizeIf',
  pure: false,
})
export class NdwuLocalizeIfPipe extends NdwuLocalizePipe implements PipeTransform {
  public override transform(key: string | undefined, shouldLocalize: boolean, args?: any): string {
    if (!shouldLocalize) {
      return key ?? '';
    }

    return super.transform(key, args);
  }
}

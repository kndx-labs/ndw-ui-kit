import {Injectable} from '@angular/core';

/**
 * Provided at the showcase component level only;
 * not reachable from the root injector.
 */
@Injectable()
export class ShowcaseScopedService {
  public readonly label = 'DialogShowcaseComponent provider';
}

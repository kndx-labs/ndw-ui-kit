import {NdwuModalOpenStrategy} from './ndwu-modal-open-strategy';
import {collapseMobileModal, expandMobileModal} from '../close-strategy/switch-modal-animation';

/**
 * Every mobile dialog gets a fade-in entrance and a matching fade-out close.
 * When nested, the previous dialog fades out as the new one enters, and fades
 * back in when the new one closes. Without this, a standalone dialog would
 * close instantly while nested children fade out, which reads as broken.
 */
export class SwitchModalOpenStrategy implements NdwuModalOpenStrategy {
  public onOpen(overlayElement: HTMLElement): void {
    expandMobileModal(overlayElement);
  }

  public onBeforeChildOpen(overlayElement: HTMLElement): void {
    collapseMobileModal(overlayElement);
  }

  public onAfterChildClose(overlayElement: HTMLElement): void {
    expandMobileModal(overlayElement);
  }
}

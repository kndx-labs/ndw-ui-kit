import type {OverlayRef} from '@angular/cdk/overlay';
import {SwitchModalOpenStrategy} from './open-strategy';
import {SwitchModalCloseStrategy} from './close-strategy';
import type {NdwuModalRef} from './ndwu-modal-ref';

export class SwitchAnimationManager {
  constructor(
    private readonly openModals: () => readonly NdwuModalRef[],
  ) {}

  public onOpen<R>(
    modalRef: NdwuModalRef<R>,
    overlayRef: OverlayRef,
    isHandset: boolean,
  ): void {
    if (modalRef.type !== 'dialog') {
      return;
    }

    if (!isHandset) {
      return;
    }

    if (modalRef.config.stackingOnMobile === 'none') {
      return;
    }

    if (!modalRef.isVisible()) {
      return;
    }

    const openModals = this.openModals();
    const isNested = openModals.length > 1;
    const shouldStack = modalRef.config.stackingOnMobile === 'stack';

    const openStrategy = new SwitchModalOpenStrategy();

    modalRef.setOpenStrategy(openStrategy);
    openStrategy.onOpen(overlayRef.overlayElement);

    let collapsedParent = false;

    if (isNested && !shouldStack) {
      const parentModal = openModals.at(-2);

      if (parentModal?.type === 'dialog') {
        let parentOpenStrategy = parentModal.getOpenStrategy();

        if (!parentOpenStrategy) {
          parentOpenStrategy = new SwitchModalOpenStrategy();
          parentModal.setOpenStrategy(parentOpenStrategy);
        }

        parentOpenStrategy.onBeforeChildOpen(parentModal.getOverlayRef().overlayElement);
        collapsedParent = true;
      }
    }

    modalRef.setCloseStrategy(
      new SwitchModalCloseStrategy(
        collapsedParent
          ? () => this.onClose(modalRef)
          : undefined,
      ),
    );
  }

  // Called after the child's fade-out, before its overlay is disposed.
  private onClose<R>(closingModal: NdwuModalRef<R>): void {
    const parentModal = this.openModals()
      .filter((ref) => ref.id !== closingModal.id)
      .at(-1);

    if (parentModal?.type !== 'dialog') {
      return;
    }

    parentModal.getOpenStrategy()
      ?.onAfterChildClose(parentModal.getOverlayRef().overlayElement);
  }
}

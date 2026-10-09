import {SwitchModalOpenStrategy} from './open-strategy';
import {SwitchModalCloseStrategy} from './close-strategy';
import type {NdwuModalController} from './ndwu-modal-controller';

// On mobile screens we avoid stacking modals on top of each other.
// Instead, we collapse the parent modal when a child modal is opened,
// and restore it when the child modal is closed.
//
// This class manages that transition.
export class TransitionManager {
  constructor(
    private readonly openModals: () => readonly NdwuModalController[],
  ) {}

  public onOpen<R>(
    controller: NdwuModalController<R>,
    isHandset: boolean,
  ): void {
    if (controller.config.type !== 'dialog') {
      return;
    }

    if (!isHandset) {
      return;
    }

    if (controller.config.stackingOnMobile === 'none') {
      return;
    }

    if (controller.state() !== 'open') {
      return;
    }

    const openModals = this.openModals();
    const isNested = openModals.length > 1;
    const shouldStack = controller.config.stackingOnMobile === 'stack';

    const openStrategy = new SwitchModalOpenStrategy();

    controller.openStrategy = openStrategy;
    openStrategy.onOpen(controller.overlayRef.overlayElement);

    let collapsedParent = false;

    if (isNested && !shouldStack) {
      const parent = openModals.at(-2);

      if (parent?.config.type === 'dialog') {
        if (parent.openStrategy === null) {
          parent.openStrategy = new SwitchModalOpenStrategy();
        }

        parent.openStrategy.onBeforeChildOpen(parent.overlayRef.overlayElement);
        collapsedParent = true;
      }
    }

    controller.closeStrategy = new SwitchModalCloseStrategy(
      collapsedParent
        ? () => this.onClose(controller)
        : undefined,
    );
  }

  // Called after the child's fade-out, before its overlay is disposed.
  private onClose<R>(closing: NdwuModalController<R>): void {
    const parent = this.openModals()
      .filter((item) => item !== closing)
      .at(-1);

    if (parent?.config.type !== 'dialog') {
      return;
    }

    parent.openStrategy?.onAfterChildClose(parent.overlayRef.overlayElement);
  }
}

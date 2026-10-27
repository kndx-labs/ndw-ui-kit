import {DOCUMENT, ErrorHandler, Injectable, Injector, TemplateRef, computed, inject, signal} from '@angular/core';
import {Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {BreakpointObserver} from '@angular/cdk/layout';
import {ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {HANDSET_BREAKPOINT, applyThemeClass, normalizeClass} from '@ndw-ui-kit/core/utils';
import {MobileScrollLockStrategy} from '@ndw-ui-kit/core/popover';
import type {NdwuModalContainerBaseDirective} from './base';
import {NdwuDialogContainerComponent} from './dialog';
import {
  NdwuAlertModalConfig,
  NdwuConfirmModalConfig,
  NdwuDialogConfig,
  NdwuDrawerConfig,
  NdwuModalButton,
  NdwuModalContentComponent,
  NdwuModalOpenTemplateOptions,
  NdwuModalTemplateContext,
  NdwuModalType,
  NdwuResolvedModalConfig,
} from './ndwu-modal.types';
import type {NdwuModalRef} from './ndwu-modal-ref';
import {NdwuModalController} from './ndwu-modal-controller';
import {NDWU_MODAL_CONFIG, NDWU_MODAL_DATA, NDWU_MODAL_REF} from './ndwu-modal.tokens';
import {NDWU_MODAL_HANDSET_OVERLAY_SIZE} from './ndwu-modal.constants';
import {NDWU_MODAL_SLOT_REGISTRY, NdwuModalSlotRegistry} from './ndwu-modal-slot-registry';
import {NDWU_MODAL_TYPE_DESCRIPTORS} from './ndwu-modal-type-descriptors';
import {TransitionManager} from './transition-manager';
import {resolveOverlayThemeClass} from './overlay-theme';

// Attaches the caller's content into the container. `null` means the
// container itself is the content (alert/confirm or a bare container class).
type NdwuModalContentAttacher<R> = (
  container: NdwuModalContainerBaseDirective,
  modalInjector: Injector,
  modalRef: NdwuModalRef<R>,
) => void;

type NdwuSystemDialogConfig = NdwuAlertModalConfig | NdwuConfirmModalConfig;

@Injectable({
  providedIn: 'root',
})
export class NdwuModalService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly errorHandler = inject(ErrorHandler);

  private readonly openModals = signal<NdwuModalController[]>([]);
  public readonly openModalCount = computed(() => this.openModals().length);

  private readonly transitionManager = new TransitionManager(this.openModals);

  public open<D = unknown, R = unknown>(
    type: 'dialog',
    content: NdwuModalContentComponent,
    config?: NdwuDialogConfig<D>,
  ): NdwuModalRef<R>;
  public open<D = unknown, R = unknown>(
    type: 'drawer',
    content: NdwuModalContentComponent,
    config?: NdwuDrawerConfig<D>,
  ): NdwuModalRef<R>;
  public open<D = unknown, R = unknown>(
    type: NdwuModalType,
    content: NdwuModalContentComponent,
    config?: NdwuDialogConfig<D> | NdwuDrawerConfig<D>,
  ): NdwuModalRef<R> {
    return this.openComponentContent(
      content,
      this.createResolvedConfig(type, config),
    );
  }

  public openDialog<D = unknown, R = unknown>(
    content: NdwuModalContentComponent,
    config?: NdwuDialogConfig<D>,
  ): NdwuModalRef<R> {
    return this.open('dialog', content, config);
  }

  public openDrawer<D = unknown, R = unknown>(
    content: NdwuModalContentComponent,
    config?: NdwuDrawerConfig<D>,
  ): NdwuModalRef<R> {
    return this.open('drawer', content, config);
  }

  public openTemplate<
    D = unknown,
    R = unknown,
    C extends object = NdwuModalTemplateContext<D, R>,
  >(
    content: TemplateRef<C>,
    options: NdwuModalOpenTemplateOptions<D, R, C>,
  ): NdwuModalRef<R> {
    const config = this.createResolvedConfig(options.type, options.config);

    return this.openWithResolvedConfig<R, D>(
      config,
      (container, modalInjector, modalRef) => {
        container.attachTemplatePortal(
          new TemplatePortal(
            content,
            options.viewContainerRef,
            this.createTemplateContext(modalRef, config, options.context),
            modalInjector,
          ),
        );
      },
    );
  }

  public alert(config: NdwuAlertModalConfig): NdwuModalRef<void> {
    return this.openSystemDialog<NdwuAlertModalConfig, void>(config, [
      {
        label: config.buttonText ?? 'OK',
        variant: 'primary',
      },
    ]);
  }

  public confirm(config: NdwuConfirmModalConfig): NdwuModalRef<boolean> {
    return this.openSystemDialog<NdwuConfirmModalConfig, boolean>(config, [
      {
        label: config.cancelText ?? 'Cancel',
        result: false,
      },
      {
        label: config.confirmText ?? 'Confirm',
        variant: config.confirmVariant ?? 'primary',
        result: true,
      },
    ]);
  }

  private static isModalContainerClass(content: NdwuModalContentComponent): boolean {
    return typeof content === 'function'
      && (
        (content as {isNdwuDialogContainer?: unknown}).isNdwuDialogContainer === true
        || (content as {isNdwuDrawerContainer?: unknown}).isNdwuDrawerContainer === true
      );
  }

  private openSystemDialog<D extends NdwuSystemDialogConfig, R>(
    config: D,
    buttons: NdwuModalButton[],
  ): NdwuModalRef<R> {
    const modalConfig: NdwuDialogConfig<D> = {
      data: config,
      title: config.header,
      stackingOnMobile: 'none',
      buttons,
    };

    if (config.description !== undefined) {
      modalConfig.description = config.description;
    }

    if (config.theme !== undefined) {
      modalConfig.theme = config.theme;
    }

    return this.openDialog<D, R>(NdwuDialogContainerComponent, modalConfig);
  }

  private createResolvedConfig<D>(
    type: NdwuModalType,
    config?: NdwuDialogConfig<D> | NdwuDrawerConfig<D>,
  ): NdwuResolvedModalConfig<D> {
    const defaults = NDWU_MODAL_TYPE_DESCRIPTORS[type].defaults as NdwuDialogConfig<D> | NdwuDrawerConfig<D>;

    // `merged` is a fresh object, so replacing its arrays does not touch
    // the caller's config.
    const merged: NdwuDialogConfig<D> & NdwuDrawerConfig<D> = {
      ...defaults,
      ...config,
    };

    if (merged.buttons !== undefined) {
      merged.buttons = merged.buttons.map((button) => {
        return {...button};
      });
    }

    if (Array.isArray(merged.panelClass)) {
      merged.panelClass = [...merged.panelClass];
    }

    // `type` goes after the spread: a resolved config passed back in
    // (e.g. `openDrawer(Content, dialogRef.config)`) must not override it.
    return {
      ...merged,
      type,
      restoreFocus: merged.restoreFocus ?? true,
    };
  }

  private openComponentContent<D, R>(
    content: NdwuModalContentComponent,
    config: NdwuResolvedModalConfig<D>,
  ): NdwuModalRef<R> {
    if (NdwuModalService.isModalContainerClass(content)) {
      return this.openWithResolvedConfig<R, D>(config, null);
    }

    return this.openWithResolvedConfig<R, D>(
      config,
      (container, modalInjector) => {
        container.attachComponentPortal(
          new ComponentPortal(content, null, modalInjector),
        );
      },
    );
  }

  private openWithResolvedConfig<R, D>(
    config: NdwuResolvedModalConfig<D>,
    attachContent: NdwuModalContentAttacher<R> | null,
  ): NdwuModalRef<R> {
    const descriptor = NDWU_MODAL_TYPE_DESCRIPTORS[config.type];
    const isHandset = this.breakpointObserver.isMatched(HANDSET_BREAKPOINT);
    const overlayRef = this.createOverlay(config, isHandset);
    const controller = new NdwuModalController<R>(
      config,
      overlayRef,
      descriptor.closeStrategy,
      this.errorHandler,
    );
    const modalInjector = this.createModalInjector(controller, config);

    this.applyOverlayTheme(overlayRef, config);

    const containerRef = overlayRef.attach(
      new ComponentPortal(descriptor.containerComponent, null, modalInjector),
    );

    attachContent?.(containerRef.instance, modalInjector, controller.ref);

    this.registerModalEvents(controller);
    this.trackOpenModal(controller);

    this.transitionManager.onOpen(controller, isHandset);

    return controller.ref;
  }

  private trackOpenModal<R>(controller: NdwuModalController<R>): void {
    this.openModals.update((current) => {
      return [...current, controller as NdwuModalController];
    });

    controller.afterClosed$
      .subscribe(() => {
        this.openModals.update((current) => {
          return current.filter((item) => item !== controller);
        });
      });
  }

  private createOverlay(config: NdwuResolvedModalConfig, isHandset: boolean): OverlayRef {
    const descriptor = NDWU_MODAL_TYPE_DESCRIPTORS[config.type];

    const overlayConfig: OverlayConfig = {
      positionStrategy: descriptor.createPositionStrategy(this.overlay),
      scrollStrategy: new MobileScrollLockStrategy(),
      hasBackdrop: true,
      backdropClass: config.backdropClass ?? descriptor.backdropClass,
      panelClass: normalizeClass(config.panelClass, descriptor.panelClass),
    };

    const overlayRef = this.overlay.create(overlayConfig);
    const size = isHandset
      ? NDWU_MODAL_HANDSET_OVERLAY_SIZE
      : descriptor.getDesktopSize(config);

    overlayRef.updateSize(size);

    return overlayRef;
  }

  private createModalInjector<D, R>(
    controller: NdwuModalController<R>,
    config: NdwuResolvedModalConfig<D>,
  ): Injector {
    const slotRegistry = new NdwuModalSlotRegistry();
    const providers = [
      {provide: NDWU_MODAL_REF, useValue: controller.ref},
      {provide: NDWU_MODAL_CONFIG, useValue: config},
      {provide: NDWU_MODAL_DATA, useValue: config.data},
      {provide: NDWU_MODAL_SLOT_REGISTRY, useValue: slotRegistry},
    ];

    return Injector.create({
      parent: config.injector ?? this.injector,
      providers,
    });
  }

  private applyOverlayTheme<D>(
    overlayRef: OverlayRef,
    config: NdwuResolvedModalConfig<D>,
  ): void {
    const themeClass = resolveOverlayThemeClass(config, this.document);

    applyThemeClass(overlayRef.overlayElement, themeClass);
  }

  private createTemplateContext<D, R, C extends object>(
    modalRef: NdwuModalRef<R>,
    config: NdwuResolvedModalConfig<D>,
    context?: C,
  ): C {
    return {
      $implicit: config.data,
      data: config.data,
      modalRef,
      ...context,
    } as C;
  }

  private registerModalEvents<R>(controller: NdwuModalController<R>): void {
    const {overlayRef, config} = controller;
    const subscriptions: Subscription[] = [];

    if (config.disableClose !== true) {
      subscriptions.push(
        overlayRef.backdropClick()
          .subscribe(() => {
            controller.closeIfAllowed();
          }),
      );

      subscriptions.push(
        overlayRef.keydownEvents()
          .pipe(
            filter(event => event.key === 'Escape'),
          )
          .subscribe(event => {
            event.preventDefault();
            controller.closeIfAllowed();
          }),
      );
    }

    controller.afterClosed$
      .subscribe(() => {
        subscriptions.forEach(sub => sub.unsubscribe());
      });

    overlayRef.detachments()
      .subscribe(() => {
        if (controller.state() === 'open') {
          controller.close();
        }
      });
  }
}

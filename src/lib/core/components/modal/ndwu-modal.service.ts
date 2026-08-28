import {DOCUMENT, Injectable, Injector, TemplateRef, computed, inject, signal} from '@angular/core';
import {GlobalPositionStrategy, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {BreakpointObserver} from '@angular/cdk/layout';
import {ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {HANDSET_BREAKPOINT, applyThemeClass, detectThemeClass, normalizeClass} from '@ndw-ui-kit/core/utils';
import {MobileScrollLockStrategy} from '@ndw-ui-kit/core/popover';
import {
  DrawerCloseStrategy,
  NDWU_DRAWER_BACKDROP_CLASS,
  NDWU_DRAWER_OVERLAY_DEFAULTS,
  NDWU_DRAWER_PANEL_CLASS,
  NdwuDrawerContainerComponent,
} from './drawer';
import {ImmediateCloseStrategy, SwitchModalCloseStrategy} from './close-strategy';
import {SwitchModalOpenStrategy} from './open-strategy';
import {NDWU_DIALOG_PANEL_CLASS, NdwuDialogContainerComponent} from './dialog';
import {
  NdwuAlertModalConfig,
  NdwuConfirmModalConfig,
  NdwuModalConfig,
  NdwuModalContentComponent,
  NdwuModalOpenTemplateOptions,
  NdwuModalSizeProp,
  NdwuModalTemplateContext,
  NdwuModalType,
  NdwuResolvedModalConfig,
} from './ndwu-modal.types';
import {NdwuModalRef} from './ndwu-modal-ref';
import {NDWU_MODAL_CONFIG, NDWU_MODAL_DATA, NDWU_MODAL_REF} from './ndwu-modal.tokens';
import {
  NDWU_MODAL_BACKDROP_CLASS,
  NDWU_MODAL_CONFIG_DEFAULTS,
  NDWU_MODAL_HANDSET_OVERLAY_SIZE,
} from './ndwu-modal.constants';
import {NDWU_MODAL_SLOT_REGISTRY, NdwuModalSlotRegistry} from './ndwu-modal-slot-registry';

@Injectable({
  providedIn: 'root',
})
export class NdwuModalService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly breakpointObserver = inject(BreakpointObserver);

  private readonly immediateCloseStrategy = new ImmediateCloseStrategy();
  private readonly drawerCloseStrategy = new DrawerCloseStrategy();

  private readonly openModals = signal<NdwuModalRef[]>([]);
  public readonly openModalCount = computed(() => this.openModals().length);

  public open<D = unknown, R = unknown>(
    type: NdwuModalType,
    content: NdwuModalContentComponent,
    config?: NdwuModalConfig<D>,
  ): NdwuModalRef<R> {
    return this.openComponentContent(
      content,
      this.createResolvedConfig(type, config),
    );
  }

  public openDialog<D = unknown, R = unknown>(
    content: NdwuModalContentComponent,
    config?: NdwuModalConfig<D>,
  ): NdwuModalRef<R> {
    return this.open('dialog', content, config);
  }

  public openDrawer<D = unknown, R = unknown>(
    content: NdwuModalContentComponent,
    config?: NdwuModalConfig<D>,
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
    const mergedConfig = this.createResolvedConfig(options.type, options.config);

    return this.openWithResolvedConfig<R, D>(
      mergedConfig,
      (overlayRef, modalRef, config) => {
        this.attachTemplateContent(
          content,
          options,
          overlayRef,
          modalRef,
          config,
        );
      },
    );
  }

  public alert(config: NdwuAlertModalConfig): NdwuModalRef<void> {
    const modalConfig: NdwuModalConfig<NdwuAlertModalConfig> = {
      data: config,
      title: config.header,
      stackingOnMobile: 'none',
      buttons: [
        {
          label: config.buttonText ?? 'OK',
          variant: 'primary',
        },
      ],
    };

    if (config.description !== undefined) {
      modalConfig.description = config.description;
    }

    if (config.theme !== undefined) {
      modalConfig.theme = config.theme;
    }

    return this.openDialog(NdwuDialogContainerComponent, modalConfig);
  }

  public confirm(config: NdwuConfirmModalConfig): NdwuModalRef<boolean> {
    const modalConfig: NdwuModalConfig<NdwuConfirmModalConfig> = {
      data: config,
      title: config.header,
      stackingOnMobile: 'none',
      buttons: [
        {
          label: config.cancelText ?? 'Cancel',
          result: false,
        },
        {
          label: config.confirmText ?? 'Confirm',
          variant: config.confirmVariant ?? 'primary',
          result: true,
        },
      ],
    };

    if (config.description !== undefined) {
      modalConfig.description = config.description;
    }

    if (config.theme !== undefined) {
      modalConfig.theme = config.theme;
    }

    return this.openDialog(NdwuDialogContainerComponent, modalConfig);
  }

  private static isModalContainerClass(content: NdwuModalContentComponent): boolean {
    return typeof content === 'function'
      && (
        (content as {isNdwuDialogContainer?: unknown}).isNdwuDialogContainer === true
        || (content as {isNdwuDrawerContainer?: unknown}).isNdwuDrawerContainer === true
      );
  }

  private createResolvedConfig<D>(
    type: NdwuModalType,
    config?: NdwuModalConfig<D>,
  ): NdwuResolvedModalConfig<D> {
    const defaults: NdwuModalConfig<D> = type === 'drawer'
      ? {
        ...(NDWU_MODAL_CONFIG_DEFAULTS as NdwuModalConfig<D>),
        ...(NDWU_DRAWER_OVERLAY_DEFAULTS as Partial<NdwuModalConfig<D>>),
      }
      : (NDWU_MODAL_CONFIG_DEFAULTS as NdwuModalConfig<D>);

    return {
      ...defaults,
      type,
      ...config,
      restoreFocus: config?.restoreFocus ?? defaults.restoreFocus ?? true,
    };
  }

  private openComponentContent<D, R>(
    content: NdwuModalContentComponent,
    config: NdwuResolvedModalConfig<D>,
  ): NdwuModalRef<R> {
    return this.openWithResolvedConfig<R, D>(
      config,
      (overlayRef, modalRef, resolvedConfig) => {
        this.attachComponentContent(content, overlayRef, modalRef, resolvedConfig);
      },
    );
  }

  private openWithResolvedConfig<R, D>(
    config: NdwuResolvedModalConfig<D>,
    attachContent: (
      overlayRef: OverlayRef,
      modalRef: NdwuModalRef<R>,
      config: NdwuResolvedModalConfig<D>,
    ) => void,
  ): NdwuModalRef<R> {
    const isHandset = this.breakpointObserver.isMatched(HANDSET_BREAKPOINT);

    const overlayRef = config.type === 'drawer'
      ? this.createDrawerOverlay(config, isHandset).overlayRef
      : this.createDialogOverlay(config, isHandset).overlayRef;

    const modalRef = this.createModalRef<R>(overlayRef, config);

    attachContent(overlayRef, modalRef, config);
    this.registerModalEvents(overlayRef, modalRef, config);
    this.trackOpenModal(modalRef);

    this.applySwitchAnimationOnOpen(modalRef, overlayRef, isHandset);

    return modalRef;
  }

  private applySwitchAnimationOnOpen<R>(
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

      if (parentModal && parentModal?.type === 'dialog') {
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
          ? () => this.restoreParentAfterClose(modalRef)
          : undefined,
      ),
    );
  }

  private restoreParentAfterClose<R>(closingModal: NdwuModalRef<R>): void {
    const parentModal = this.openModals()
      .filter((ref) => ref.id !== closingModal.id)
      .at(-1);

    if (!parentModal || parentModal?.type !== 'dialog') {
      return;
    }

    parentModal.getOpenStrategy()
      ?.onAfterChildClose(parentModal.getOverlayRef().overlayElement);
  }

  private createDesktopPositionStrategy(): GlobalPositionStrategy {
    return this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();
  }

  private createDrawerPositionStrategy(): GlobalPositionStrategy {
    return this.overlay.position()
      .global()
      .right('0')
      .top('0');
  }

  private trackOpenModal<R>(modalRef: NdwuModalRef<R>): void {
    this.openModals.update((current) => [
      ...current,
      modalRef as NdwuModalRef,
    ]);

    const refId = modalRef.id;

    modalRef.afterClosed$
      .subscribe(() => {
        this.openModals.update((current) => {
          return current.filter((ref) => ref.id !== refId);
        });
      });
  }

  private createDialogOverlay(config: NdwuModalConfig, isHandset: boolean): {overlayRef: OverlayRef} {
    const positionStrategy = this.createDesktopPositionStrategy();

    const overlayConfig: OverlayConfig = {
      positionStrategy: positionStrategy,
      scrollStrategy: new MobileScrollLockStrategy(),
      hasBackdrop: true,
      backdropClass: config.backdropClass ?? NDWU_MODAL_BACKDROP_CLASS,
      panelClass: normalizeClass(config.panelClass, NDWU_DIALOG_PANEL_CLASS),
    };

    const sizeProps: Array<NdwuModalSizeProp> = [
      'width',
      'minWidth',
      'maxWidth',
      'height',
      'minHeight',
      'maxHeight',
    ];

    const overlayRef = this.overlay.create(overlayConfig);

    const applyDesktopSizing = (): void => {
      const size: Partial<{
        width: string;
        minWidth: string;
        maxWidth: string;
        height: string;
        minHeight: string;
        maxHeight: string;
      }> = {};

      sizeProps.forEach((prop) => {
        if (config[prop] !== undefined) {
          size[prop] = config[prop];
        }
      });

      overlayRef.updateSize(size);
    };

    const applyHandsetSizing = (): void => {
      overlayRef.updateSize(NDWU_MODAL_HANDSET_OVERLAY_SIZE);
    };

    if (isHandset) {
      applyHandsetSizing();
    } else {
      applyDesktopSizing();
    }

    return {overlayRef};
  }

  private createDrawerOverlay(config: NdwuModalConfig, isHandset: boolean): {overlayRef: OverlayRef} {
    const positionStrategy = this.createDrawerPositionStrategy();

    const overlayConfig: OverlayConfig = {
      positionStrategy: positionStrategy,
      scrollStrategy: new MobileScrollLockStrategy(),
      hasBackdrop: true,
      backdropClass: config.backdropClass ?? NDWU_DRAWER_BACKDROP_CLASS,
      panelClass: normalizeClass(config.panelClass, NDWU_DRAWER_PANEL_CLASS),
    };

    const overlayRef = this.overlay.create(overlayConfig);

    if (isHandset) {
      overlayRef.updateSize(NDWU_MODAL_HANDSET_OVERLAY_SIZE);
    } else {
      overlayRef.updateSize({
        width: config.width ?? NDWU_DRAWER_OVERLAY_DEFAULTS.width ?? '',
        height: config.height ?? NDWU_DRAWER_OVERLAY_DEFAULTS.height ?? '',
        maxHeight: NDWU_DRAWER_OVERLAY_DEFAULTS.maxHeight ?? '',
      });
    }

    return {overlayRef};
  }

  private createModalRef<R>(
    overlayRef: OverlayRef,
    config: NdwuResolvedModalConfig,
  ): NdwuModalRef<R> {
    const strategy = config.type === 'drawer'
      ? this.drawerCloseStrategy
      : this.immediateCloseStrategy;

    return new NdwuModalRef<R>(config, config.id, overlayRef, strategy);
  }

  private createModalInjector<D, R>(
    modalRef: NdwuModalRef<R>,
    config: NdwuResolvedModalConfig<D>,
  ): Injector {
    const slotRegistry = new NdwuModalSlotRegistry();
    const providers = [
      {provide: NDWU_MODAL_REF, useValue: modalRef},
      {provide: NDWU_MODAL_CONFIG, useValue: config},
      {provide: NDWU_MODAL_DATA, useValue: config.data},
      {provide: NDWU_MODAL_SLOT_REGISTRY, useValue: slotRegistry},
    ];

    return Injector.create({
      parent: this.injector,
      providers,
    });
  }

  private applyOverlayTheme<D>(
    overlayRef: OverlayRef,
    config: NdwuResolvedModalConfig<D>,
  ): void {
    let themeClass: string | null = null;

    if (config.theme) {
      themeClass = `ndwu-theme-${config.theme}`;
    } else if (this.document.body instanceof HTMLElement) {
      themeClass = detectThemeClass(this.document.body);
    }

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

  private attachTemplateContent<D, R, C extends object>(
    content: TemplateRef<C>,
    options: NdwuModalOpenTemplateOptions<D, R, C>,
    overlayRef: OverlayRef,
    modalRef: NdwuModalRef<R>,
    config: NdwuResolvedModalConfig<D>,
  ): void {
    this.applyOverlayTheme(overlayRef, config);

    const modalInjector = this.createModalInjector(modalRef, config);
    const containerRef = this.attachContainer(config, overlayRef, modalInjector);

    containerRef.instance.attachTemplatePortal(
      new TemplatePortal(
        content,
        options.viewContainerRef,
        this.createTemplateContext(modalRef, config, options.context),
        modalInjector,
      ),
    );
  }

  private attachComponentContent<D, R>(
    content: NdwuModalContentComponent,
    overlayRef: OverlayRef,
    modalRef: NdwuModalRef<R>,
    config: NdwuResolvedModalConfig<D>,
  ): void {
    this.applyOverlayTheme(overlayRef, config);

    const modalInjector = this.createModalInjector(modalRef, config);

    if (NdwuModalService.isModalContainerClass(content)) {
      const containerPortal = new ComponentPortal(
        config.type === 'drawer'
          ? NdwuDrawerContainerComponent
          : NdwuDialogContainerComponent,
        null,
        modalInjector,
      );

      overlayRef.attach(containerPortal);

      return;
    }

    const containerRef = this.attachContainer(config, overlayRef, modalInjector);

    containerRef.instance.attachComponentPortal(
      new ComponentPortal(content, null, modalInjector),
    );
  }

  private attachContainer(
    config: NdwuResolvedModalConfig,
    overlayRef: OverlayRef,
    modalInjector: Injector,
  ) {
    const containerPortal = new ComponentPortal(
      config.type === 'drawer'
        ? NdwuDrawerContainerComponent
        : NdwuDialogContainerComponent,
      null,
      modalInjector,
    );

    return overlayRef.attach(containerPortal);
  }

  private registerModalEvents<T>(
    overlayRef: OverlayRef,
    modalRef: NdwuModalRef<T>,
    config: NdwuModalConfig,
  ): void {
    const subscriptions: Subscription[] = [];

    if (config.disableClose !== true) {
      subscriptions.push(
        overlayRef.backdropClick()
          .subscribe(() => {
            modalRef.closeIfAllowed();
          }),
      );

      subscriptions.push(
        overlayRef.keydownEvents()
          .pipe(
            filter(event => event.key === 'Escape'),
          )
          .subscribe(event => {
            event.preventDefault();
            modalRef.closeIfAllowed();
          }),
      );
    }

    modalRef.afterClosed$
      .subscribe(() => {
        subscriptions.forEach(sub => sub.unsubscribe());
      });

    overlayRef.detachments()
      .subscribe(() => {
        if (modalRef.isVisible()) {
          modalRef.close();
        }
      });
  }
}

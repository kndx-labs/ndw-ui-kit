import {DOCUMENT, Injectable, Injector, TemplateRef, computed, inject, signal} from '@angular/core';
import {GlobalPositionStrategy, Overlay, OverlayConfig, OverlayRef, OverlaySizeConfig} from '@angular/cdk/overlay';
import {BreakpointObserver} from '@angular/cdk/layout';
import {ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {HANDSET_BREAKPOINT, applyThemeClass, normalizeClass} from '@ndw-ui-kit/core/utils';
import {MobileScrollLockStrategy} from '@ndw-ui-kit/core/popover';
import {
  NDWU_DRAWER_BACKDROP_CLASS,
  NDWU_DRAWER_CONFIG_DEFAULTS,
  NDWU_DRAWER_HEIGHT,
  NDWU_DRAWER_PANEL_CLASS,
  NDWU_DRAWER_WIDTH,
  NdwuDrawerCloseStrategy,
  NdwuDrawerContainerComponent,
} from './drawer';
import {ImmediateCloseStrategy} from './close-strategy';
import {NDWU_DIALOG_CONFIG_DEFAULTS, NDWU_DIALOG_PANEL_CLASS, NdwuDialogContainerComponent} from './dialog';
import {
  NdwuAlertModalConfig,
  NdwuConfirmModalConfig,
  NdwuDialogConfig,
  NdwuDrawerConfig,
  NdwuModalBaseConfig,
  NdwuModalContentComponent,
  NdwuModalOpenTemplateOptions,
  NdwuModalSizeProp,
  NdwuModalTemplateContext,
  NdwuModalType,
  NdwuResolvedModalConfig,
} from './ndwu-modal.types';
import {NdwuModalRef} from './ndwu-modal-ref';
import {NDWU_MODAL_CONFIG, NDWU_MODAL_DATA, NDWU_MODAL_REF} from './ndwu-modal.tokens';
import {NDWU_MODAL_BACKDROP_CLASS, NDWU_MODAL_HANDSET_OVERLAY_SIZE} from './ndwu-modal.constants';
import {NDWU_MODAL_SLOT_REGISTRY, NdwuModalSlotRegistry} from './ndwu-modal-slot-registry';
import {TransitionManager} from './transition-manager';
import {NDWU_SIZE} from '../../../shared.types';
import {resolveOverlayThemeClass} from './overlay-theme';

interface OverlayCreationParams {
  positionStrategy: GlobalPositionStrategy;
  backdropClass: string | string[];
  panelClass: string;
  desktopSize: OverlaySizeConfig;
  config: NdwuResolvedModalConfig;
  isHandset: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NdwuModalService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly breakpointObserver = inject(BreakpointObserver);

  private readonly immediateCloseStrategy = new ImmediateCloseStrategy();
  private readonly drawerCloseStrategy = new NdwuDrawerCloseStrategy();

  private readonly openModals = signal<NdwuModalRef[]>([]);
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
    const modalConfig: NdwuDialogConfig<NdwuAlertModalConfig> = {
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
    const modalConfig: NdwuDialogConfig<NdwuConfirmModalConfig> = {
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
    config?: NdwuDialogConfig<D> | NdwuDrawerConfig<D>,
  ): NdwuResolvedModalConfig<D> {
    const defaults: NdwuDialogConfig<D> | NdwuDrawerConfig<D> = type === 'drawer'
      ? (NDWU_DRAWER_CONFIG_DEFAULTS as NdwuDrawerConfig<D>)
      : (NDWU_DIALOG_CONFIG_DEFAULTS as NdwuDialogConfig<D>);

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
      ? this.createDrawerOverlay(config, isHandset)
      : this.createDialogOverlay(config, isHandset);

    const modalRef = this.createModalRef<R>(overlayRef, config);

    attachContent(overlayRef, modalRef, config);
    this.registerModalEvents(overlayRef, modalRef, config);
    this.trackOpenModal(modalRef);

    this.transitionManager.onOpen(modalRef, overlayRef, isHandset);

    return modalRef;
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

  private createOverlay(overlayCreationParams: OverlayCreationParams): OverlayRef {
    const {positionStrategy, backdropClass, panelClass, desktopSize, config, isHandset} = overlayCreationParams;

    const overlayConfig: OverlayConfig = {
      positionStrategy,
      scrollStrategy: new MobileScrollLockStrategy(),
      hasBackdrop: true,
      backdropClass: config.backdropClass ?? backdropClass,
      panelClass: normalizeClass(config.panelClass, panelClass),
    };

    const overlayRef = this.overlay.create(overlayConfig);

    overlayRef.updateSize(isHandset ? NDWU_MODAL_HANDSET_OVERLAY_SIZE : desktopSize);

    return overlayRef;
  }

  private createDialogOverlay(config: NdwuResolvedModalConfig, isHandset: boolean): OverlayRef {
    return this.createOverlay({
      positionStrategy: this.createDesktopPositionStrategy(),
      backdropClass: NDWU_MODAL_BACKDROP_CLASS,
      panelClass: NDWU_DIALOG_PANEL_CLASS,
      desktopSize: this.getDialogDesktopSize(config),
      config,
      isHandset,
    });
  }

  private getDialogDesktopSize(config: NdwuResolvedModalConfig): OverlaySizeConfig {
    const sizeProps: Array<NdwuModalSizeProp> = [
      'width',
      'minWidth',
      'maxWidth',
      'height',
      'minHeight',
      'maxHeight',
    ];

    const desktopSize: Partial<Record<NdwuModalSizeProp, string>> = {};

    sizeProps.forEach((prop) => {
      if (config[prop] !== undefined) {
        desktopSize[prop] = config[prop];
      }
    });

    return desktopSize;
  }

  private createDrawerOverlay(config: NdwuResolvedModalConfig, isHandset: boolean): OverlayRef {
    return this.createOverlay({
      positionStrategy: this.createDrawerPositionStrategy(),
      backdropClass: NDWU_DRAWER_BACKDROP_CLASS,
      panelClass: NDWU_DRAWER_PANEL_CLASS,
      desktopSize: {
        width: NDWU_DRAWER_WIDTH[config.size ?? NDWU_SIZE.XL],
        height: NDWU_DRAWER_HEIGHT,
        maxHeight: NDWU_DRAWER_HEIGHT,
      },
      config,
      isHandset,
    });
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
    config: NdwuModalBaseConfig,
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

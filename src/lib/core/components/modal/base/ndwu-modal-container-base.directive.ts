import {
  AfterRenderRef,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import {CdkPortalOutlet, ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {InteractivityChecker} from '@angular/cdk/a11y';
import {NDWU_ICON_NAME} from '../../../../icon-names';
import {NDWU_MODAL_CONFIG, NDWU_MODAL_DATA, NDWU_MODAL_REF} from '../ndwu-modal.tokens';
import type {NdwuModalButton, NdwuResolvedModalConfig} from '../ndwu-modal.types';
import type {NdwuModalRef} from '../ndwu-modal-ref';
import {NDWU_MODAL_BASE_CONFIG_DEFAULTS} from '../ndwu-modal.constants';
import {NDWU_MODAL_SLOT_REGISTRY} from '../ndwu-modal-slot-registry';

@Directive()
export class NdwuModalContainerBaseDirective {
  public readonly ICON_NAME = NDWU_ICON_NAME;

  public readonly modalRef = inject<NdwuModalRef>(NDWU_MODAL_REF);
  public readonly config = inject<NdwuResolvedModalConfig>(NDWU_MODAL_CONFIG);
  public readonly data = inject<unknown>(NDWU_MODAL_DATA, {optional: true});
  public readonly slotRegistry = inject(NDWU_MODAL_SLOT_REGISTRY);

  public readonly type = this.modalRef.type;

  public readonly title = this.modalRef.title;

  public readonly customHeaderTemplate = this.slotRegistry.headerTemplate.asReadonly();
  public readonly customFooterTemplate = this.slotRegistry.footerTemplate.asReadonly();
  public readonly hasCustomHeaderSlot = computed(() => this.customHeaderTemplate() !== null);
  public readonly hasCustomFooterSlot = computed(() => this.customFooterTemplate() !== null);

  public readonly titleAriaId = computed(() => {
    return this.hasDefaultHeader() && this.title()
      ? `${this.modalRef.id}-title`
      : null;
  });

  public readonly description = this.modalRef.description;
  public readonly descriptionAriaId = computed(() => {
    return this.hasDefaultHeaderDescription() && this.description()
      ? `${this.modalRef.id}-description`
      : null;
  });

  public readonly ariaLabel = computed(() => {
    if (this.config.ariaLabel) {
      return this.config.ariaLabel;
    }

    if (this.config.ariaLabelledby) {
      return null;
    }

    if (this.hasCustomHeaderSlot()) {
      return this.title() ?? null;
    }

    return null;
  });

  public readonly ariaLabelledby = computed(() => {
    if (this.ariaLabel()) {
      return null;
    }

    return this.config.ariaLabelledby ?? this.titleAriaId();
  });

  public readonly closeButtonAriaLabel = computed(() => {
    return this.config.closeButtonAriaLabel ?? 'Close';
  });

  public readonly hasDefaultHeader = computed(() => {
    return !this.hasCustomHeaderSlot() && this.title() !== null;
  });

  public readonly hasDefaultFooter = computed(() => {
    return !this.hasCustomFooterSlot()
      && (this.config.buttons ?? []).length > 0;
  });

  public readonly hasCloseButton = computed(() => this.config.hasCloseButton !== false);

  public readonly hasDefaultHeaderDescription = computed(() => {
    return !this.hasCustomHeaderSlot() && this.description() !== null;
  });

  public readonly isCloseButtonDisabled = computed(() => this.config.disableClose === true);

  public readonly trapFocus = computed(() => this.config.trapFocus ?? true);
  public readonly isAutoFocusEnabled = computed(() => this.config.autoFocus !== false);
  public readonly isLoading = this.modalRef.isLoading;

  protected readonly interactivityChecker = inject(InteractivityChecker);
  protected readonly document = inject(DOCUMENT);
  protected readonly destroyRef = inject(DestroyRef);

  /* --- specified in templates of classes extending this one --- */
  protected readonly modalElement = viewChild.required<ElementRef<HTMLElement>>('modalElement');
  protected readonly bodyElement = viewChild<ElementRef<HTMLElement>>('bodyElement');
  protected readonly portalOutlet = viewChild.required(CdkPortalOutlet);

  protected previouslyFocusedElement: HTMLElement | null = null;
  protected readonly hostElement: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private initialFocusEffect: AfterRenderRef | null = null;

  constructor() {
    // The container is created inside `overlayRef.attach()`, before any
    // focus moves, so the active element is still the modal's trigger.
    this.previouslyFocusedElement = this.getActiveElement();

    // Runs after render and again when `isLoading` (or a view query) changes,
    // until the initial focus is applied once; then the effect destroys
    // itself, so later loading toggles never move focus. It never runs
    // synchronously, so `initialFocusEffect` is assigned by the first run.
    this.initialFocusEffect = afterRenderEffect(() => {
      if (this.isLoading()) {
        this.focusModalElementIfFocusOutside();

        return;
      }

      this.applyInitialFocus();
      this.initialFocusEffect?.destroy();
      this.initialFocusEffect = null;
    });

    this.destroyRef.onDestroy(() => {
      this.restoreFocus();
    });
  }

  public attachComponentPortal<T>(portal: ComponentPortal<T>): void {
    this.portalOutlet().attachComponentPortal(portal);
  }

  public attachTemplatePortal<T>(portal: TemplatePortal<T>): void {
    this.portalOutlet().attachTemplatePortal(portal);
  }

  protected handleClose(): void {
    this.modalRef.closeIfAllowed();
  }

  protected handleButtonClick(button: NdwuModalButton): void {
    if (button.onClick) {
      button.onClick(this.modalRef);
    } else {
      // Default `click` handler for alert/confirm
      this.modalRef.closeIfAllowed(button.result);
    }
  }

  protected getBodyElement(): HTMLElement | null {
    return this.bodyElement()?.nativeElement ?? null;
  }

  protected applyInitialFocus(): void {
    // The user may have moved focus into the content while it was loading.
    if (this.hasFocusInsideContent()) {
      return;
    }

    if (this.isAutoFocusEnabled()) {
      this.applyAutoFocus();
    }

    // `autoFocus: false`, or nothing matched (e.g. no focusable heading in
    // a custom header): keep focus inside the modal anyway.
    this.focusModalElementIfFocusOutside();
  }

  protected restoreFocus(): void {
    const target = this.previouslyFocusedElement;

    if (!this.config.restoreFocus || !target?.isConnected) {
      return;
    }

    // Do not steal focus if the user already moved it elsewhere.
    const active = this.getActiveElement();
    const isFocusLeftBehind = active === null
      || active === this.document.body
      || this.hostElement.contains(active);

    if (isFocusLeftBehind) {
      target.focus();
    }
  }

  protected focusModalElementIfFocusOutside(): void {
    const active = this.getActiveElement();

    if (active !== null && this.hostElement.contains(active)) {
      return;
    }

    this.modalElement().nativeElement.focus();
  }

  protected hasFocusInsideContent(): boolean {
    const modalElement = this.modalElement().nativeElement;
    const active = this.getActiveElement();

    return active !== null
      && active !== modalElement
      && modalElement.contains(active);
  }

  protected getActiveElement(): HTMLElement | null {
    const active = this.document.activeElement;

    return active instanceof HTMLElement ? active : null;
  }

  protected focusFirstTabbable(element: HTMLElement): void {
    // Skip links even if one is the first tabbable element
    const skipElements = Array.from(element.querySelectorAll<HTMLElement>('a'));

    const findFirstTabbable = (
      root: ParentNode,
      skipList?: HTMLElement[],
    ): HTMLElement | undefined => {
      const childNodes = Array.from(root.querySelectorAll<HTMLElement>('*'));

      return childNodes.find((el) => {
        if (skipList?.some((skip) => skip.contains(el))) {
          return false;
        }

        return this.interactivityChecker.isFocusable(el)
          && this.interactivityChecker.isTabbable(el);
      });
    };

    const body = this.getBodyElement();
    const firstInBody = body ? findFirstTabbable(body, skipElements) : undefined;
    const firstInDialog = findFirstTabbable(element, skipElements);
    const target = firstInBody ?? firstInDialog ?? element;

    target.focus();
  }

  protected applyAutoFocus(): void {
    const autoFocus = this.config.autoFocus ?? NDWU_MODAL_BASE_CONFIG_DEFAULTS.autoFocus;
    const element = this.modalElement().nativeElement;

    if (!element) {
      return;
    }

    switch (autoFocus) {
      case 'dialog':
        element.focus();
        break;

      case 'first-heading': {
        const heading = element.querySelector('h1, h2, h3, h4, h5, h6');

        if (heading instanceof HTMLElement) {
          heading.focus();
        }

        break;
      }

      case 'first-tabbable':
        this.focusFirstTabbable(element);

        break;

      case true: {
        const customInitialFocus = element.querySelector('[cdkFocusInitial]');

        if (customInitialFocus instanceof HTMLElement) {
          customInitialFocus.focus();
        } else {
          this.focusFirstTabbable(element);
        }

        break;
      }
    }
  }
}

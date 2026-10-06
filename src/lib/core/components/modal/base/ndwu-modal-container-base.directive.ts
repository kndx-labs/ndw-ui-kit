/* eslint no-case-declarations: 0 */
import {DOCUMENT, DestroyRef, Directive, ElementRef, afterNextRender, computed, inject, viewChild} from '@angular/core';
import {CdkPortalOutlet, ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {InteractivityChecker} from '@angular/cdk/a11y';
import {BreakpointObserver} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {NDWU_ICON_NAME} from '../../../../icon-names';
import {NDWU_MODAL_CONFIG, NDWU_MODAL_DATA, NDWU_MODAL_REF} from '../ndwu-modal.tokens';
import type {NdwuModalButton, NdwuResolvedModalConfig} from '../ndwu-modal.types';
import type {NdwuModalRef} from '../ndwu-modal-ref';
import {NDWU_MODAL_BASE_CONFIG_DEFAULTS} from '../ndwu-modal.constants';
import {NDWU_MODAL_SLOT_REGISTRY} from '../ndwu-modal-slot-registry';
import {HANDSET_BREAKPOINT} from '@ndw-ui-kit/core/utils';

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

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly isHandset = toSignal(
    this.breakpointObserver.observe(HANDSET_BREAKPOINT).pipe(map((r) => r.matches)),
    {initialValue: this.breakpointObserver.isMatched(HANDSET_BREAKPOINT)},
  );

  public readonly closeIcon = computed(() => {
    return this.isHandset() ? NDWU_ICON_NAME.CLOSE_S : NDWU_ICON_NAME.CLOSE_L;
  });

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

  constructor() {
    afterNextRender(() => {
      this.previouslyFocusedElement = this.document.activeElement as HTMLElement | null;

      if (this.isAutoFocusEnabled()) {
        this.applyAutoFocus();
      }
    });

    this.destroyRef.onDestroy(() => {
      if (
        this.config.restoreFocus
        && this.previouslyFocusedElement?.isConnected
      ) {
        this.previouslyFocusedElement.focus();
      }
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

      case 'first-tabbable': {
        // Even with this option we will skip link if it is the first tabbable element inside a dialog.
        //
        // @see internal design spec: focus order
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

        break;
      }

      case true:
        const customInitialFocus = element.querySelector('[cdkFocusInitial]');

        if (customInitialFocus instanceof HTMLElement) {
          customInitialFocus.focus();
        }

        break;
    }
  }
}

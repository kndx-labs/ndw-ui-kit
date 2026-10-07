import type {Injector, Type, ViewContainerRef} from '@angular/core';
import type {NdwuButtonVariant} from '../button/button/ndwu-button.component';
import {NDWU_SIZE, NdwuTheme} from '../../../shared.types';
import type {NdwuModalRef} from './ndwu-modal-ref';

export type NdwuModalAutoFocus =
  | boolean
  | 'dialog'
  | 'first-tabbable'
  | 'first-heading';

export type NdwuModalSizeProp =
  | 'width'
  | 'minWidth'
  | 'maxWidth'
  | 'height'
  | 'minHeight'
  | 'maxHeight';

export interface NdwuModalButton {
  label: string;
  variant?: NdwuButtonVariant;
  result?: unknown;
  onClick?: (ref: NdwuModalRef) => void;
}

/**
 * Drawer panel width preset. Affects only the panel width,
 * not the size of controls rendered inside the drawer.
 */
export type NdwuDrawerSize = typeof NDWU_SIZE.XL | typeof NDWU_SIZE.XXL;

export interface NdwuModalBaseConfig<ModalData = unknown> {
  data?: ModalData;
  title?: string;
  description?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  buttons?: NdwuModalButton[];
  panelClass?: string | string[];
  backdropClass?: string;
  disableClose?: boolean;
  hasCloseButton?: boolean;
  id?: string;
  theme?: NdwuTheme;
  isLoading?: boolean;
  trapFocus?: boolean;
  autoFocus?: NdwuModalAutoFocus;
  restoreFocus?: boolean;
  closeButtonAriaLabel?: string;
  stackingOnMobile?: 'stack' | 'replace' | 'none';
  /**
   * Parent injector for the modal container and its content.
   * Defaults to the injector of `NdwuModalService` (root).
   * Pass a route- or component-level injector to make its providers
   * available inside the modal.
   */
  injector?: Injector;
}

export interface NdwuDialogConfig<ModalData = unknown> extends NdwuModalBaseConfig<ModalData> {
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
}

export interface NdwuDrawerConfig<ModalData = unknown> extends NdwuModalBaseConfig<ModalData> {
  /** Panel width preset: `XL` (default) or `XXL`. */
  size?: NdwuDrawerSize;
}

export interface NdwuAlertModalConfig {
  header: string;
  description?: string;
  buttonText?: string;
  theme?: NdwuTheme;
}

export interface NdwuConfirmModalConfig {
  header: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: NdwuButtonVariant;
  theme?: NdwuTheme;
}

export type NdwuModalContentComponent = Type<unknown>;

export interface NdwuModalTemplateContext<ModalData = unknown, ReturnT = unknown> {
  $implicit?: ModalData;
  data?: ModalData;
  modalRef?: NdwuModalRef<ReturnT>;
}

interface NdwuModalOpenTemplateBaseOptions<TemplateContext extends object> {
  viewContainerRef: ViewContainerRef;
  context?: TemplateContext;
}

export interface NdwuDialogOpenTemplateOptions<ModalData, TemplateContext extends object>
  extends NdwuModalOpenTemplateBaseOptions<TemplateContext> {
  type: 'dialog';
  config?: NdwuDialogConfig<ModalData>;
}

export interface NdwuDrawerOpenTemplateOptions<ModalData, TemplateContext extends object>
  extends NdwuModalOpenTemplateBaseOptions<TemplateContext> {
  type: 'drawer';
  config?: NdwuDrawerConfig<ModalData>;
}

export type NdwuModalOpenTemplateOptions<
  ModalData = unknown,
  ReturnT = unknown,
  TemplateContext extends object = NdwuModalTemplateContext<ModalData, ReturnT>,
> =
  | NdwuDialogOpenTemplateOptions<ModalData, TemplateContext>
  | NdwuDrawerOpenTemplateOptions<ModalData, TemplateContext>;

export type NdwuModalType = 'dialog' | 'drawer';

export type NdwuResolvedModalConfig<D = unknown> =
  & Omit<NdwuDialogConfig<D> & NdwuDrawerConfig<D>, 'restoreFocus'>
  & {
    type: NdwuModalType;
    restoreFocus: boolean;
  };

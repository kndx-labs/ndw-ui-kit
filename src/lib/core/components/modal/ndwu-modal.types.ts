import type {Type, ViewContainerRef} from '@angular/core';
import type {NdwuButtonVariant} from '../button/button/ndwu-button.component';
import {NdwuTheme} from '../../../shared.types';
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

export interface NdwuModalConfig<ModalData = unknown> {
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
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  isLoading?: boolean;
  trapFocus?: boolean;
  autoFocus?: NdwuModalAutoFocus;
  restoreFocus?: boolean;
  closeButtonAriaLabel?: string;
  stackingOnMobile?: 'stack' | 'replace' | 'none';
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

export interface NdwuModalOpenTemplateOptions<
  ModalData = unknown,
  ReturnT = unknown,
  TemplateContext extends object = NdwuModalTemplateContext<ModalData, ReturnT>,
> {
  type: NdwuModalType;
  viewContainerRef: ViewContainerRef;
  config?: NdwuModalConfig<ModalData>;
  context?: TemplateContext;
}

export type NdwuModalType = 'dialog' | 'drawer';

export type NdwuResolvedModalConfig<D = unknown> =
  & Omit<NdwuModalConfig<D>, 'restoreFocus'>
  & {
    type: NdwuModalType;
    restoreFocus: boolean;
  };

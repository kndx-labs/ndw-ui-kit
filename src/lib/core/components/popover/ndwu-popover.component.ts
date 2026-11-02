import {ChangeDetectionStrategy, Component, TemplateRef, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NDWU_ICON_NAME} from '../../../icon-names';
import {NdwuIconButtonComponent} from '../button/icon-button/ndwu-icon-button.component';
import {NdwuButtonComponent} from '../button/button/ndwu-button.component';
import type {NdwuPopoverButton} from './ndwu-popover.types';
import {
  NDWU_POPOVER_BODY,
  NDWU_POPOVER_BUTTONS,
  NDWU_POPOVER_CLOSE_ARIA_LABEL,
  NDWU_POPOVER_CLOSE_FN,
  NDWU_POPOVER_ID,
  NDWU_POPOVER_SHOW_CLOSE,
  NDWU_POPOVER_SHOW_HEADER,
  NDWU_POPOVER_TITLE,
} from './ndwu-popover.tokens';

@Component({
  selector: 'ndwu-popover',
  templateUrl: './ndwu-popover.component.html',
  styleUrl: './ndwu-popover.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NdwuButtonComponent,
    NdwuIconButtonComponent,
  ],
})
export class NdwuPopoverComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;

  protected readonly popoverId = inject(NDWU_POPOVER_ID, {optional: true}) ?? null;
  protected readonly title = inject(NDWU_POPOVER_TITLE, {optional: true}) ?? null;
  protected readonly showHeader = inject(NDWU_POPOVER_SHOW_HEADER, {optional: true}) ?? false;
  protected readonly showClose = inject(NDWU_POPOVER_SHOW_CLOSE, {optional: true}) ?? true;
  protected readonly closeAriaLabel = inject(NDWU_POPOVER_CLOSE_ARIA_LABEL, {optional: true}) ?? 'Close';
  protected readonly buttons = inject(NDWU_POPOVER_BUTTONS, {optional: true}) ?? [];
  protected readonly bodyContent = inject(NDWU_POPOVER_BODY, {optional: true});
  protected readonly closeFn = inject(NDWU_POPOVER_CLOSE_FN);

  protected get isString(): boolean {
    return typeof this.bodyContent === 'string';
  }

  protected get bodyString(): string {
    return typeof this.bodyContent === 'string' ? this.bodyContent : '';
  }

  protected get bodyTemplate(): TemplateRef<unknown> | null {
    return this.bodyContent instanceof TemplateRef ? this.bodyContent : null;
  }

  protected handleClose(): void {
    this.closeFn();
  }

  protected handleButtonClick(button: NdwuPopoverButton): void {
    if (button.onClick) {
      button.onClick();
    }

    this.handleClose();
  }
}

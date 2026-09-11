import {Component, effect, inject, input} from '@angular/core';
import {importProvidersFrom} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {
  type ButtonVariant,
  NdwuButtonComponent,
  NdwuDialogContainerComponent,
  NdwuModalRef,
  NdwuModalService,
} from '@ndw-ui-kit/core';

export const dialogProviders = [
  importProvidersFrom(OverlayModule),
];

@Component({
  selector: 'app-dialog-story',
  imports: [NdwuButtonComponent],
  template: `
    <div class="storybook-row">
      <button ndwuButton label="Open dialog" variant="primary" size="XL" (click)="open()"></button>
    </div>
  `,
})
export class DialogStoryComponent {
  readonly title = input('Dialog title');
  readonly description = input<string | null>(null);
  readonly width = input('480px');
  readonly hasCloseButton = input(true);
  readonly disableClose = input(false);
  readonly isLoading = input(false);
  readonly confirmLabel = input('OK');
  readonly confirmVariant = input<ButtonVariant>('primary');
  readonly cancelLabel = input<string | null>(null);

  private readonly modalService = inject(NdwuModalService);
  private currentRef: NdwuModalRef | null = null;

  constructor() {
    effect(() => {
      const loading = this.isLoading();

      if (this.currentRef) {
        this.currentRef.isLoading.set(loading);
      }
    });
  }

  open(): void {
    const buttons = [];

    if (this.cancelLabel()) {
      buttons.push({label: this.cancelLabel()!, variant: 'secondary' as ButtonVariant});
    }

    buttons.push({label: this.confirmLabel(), variant: this.confirmVariant()});

    this.currentRef = this.modalService.openDialog(
      NdwuDialogContainerComponent,
      {
        title: this.title(),
        ...(this.description() ? {description: this.description()!} : {}),
        width: this.width(),
        hasCloseButton: this.hasCloseButton(),
        disableClose: this.disableClose(),
        isLoading: this.isLoading(),
        buttons,
      },
    );
  }
}

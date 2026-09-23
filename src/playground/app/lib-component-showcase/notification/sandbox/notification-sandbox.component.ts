import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NOTIFICATION_VARIANT, NdwuNotificationComponent, NdwuNotificationVariant} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {CssUtils} from '@app/utils';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

export const NOTIFICATION_STATE = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

const NOTIFICATION_TOKEN_KEYS = [
  'notification-text',
  'notification-info-bg',
  'notification-info-icon',
  'notification-success-bg',
  'notification-success-icon',
  'notification-warning-bg',
  'notification-warning-icon',
  'notification-error-bg',
  'notification-error-icon',
] as const;

function tokenKeyToCssVar(key: string): string {
  return CssUtils.tokenKeyToCssVar(key);
}

@Component({
  selector: 'app-notification-sandbox',
  templateUrl: './notification-sandbox.component.html',
  styleUrl: './notification-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuNotificationComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class NotificationSandboxComponent extends SandboxBaseComponent {
  public readonly NOTIFICATION_STATE = NOTIFICATION_STATE;
  public readonly NOTIFICATION_VARIANT = NOTIFICATION_VARIANT;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly sandboxForm = new FormGroup({
    variant: new FormControl<NdwuNotificationVariant>(NOTIFICATION_VARIANT.INFO, {nonNullable: true}),
    message: new FormControl<string>('This is a notification message', {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      NOTIFICATION_TOKEN_KEYS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ) as Record<(typeof NOTIFICATION_TOKEN_KEYS)[number], FormControl<string>>,
  );

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  protected override readonly tokenMapping: TokenMapping[] = NOTIFICATION_TOKEN_KEYS.map((key) => ({
    key,
    cssVar: tokenKeyToCssVar(key),
  }));

  public tokenListForCurrentType(): readonly TokenListItem[] {
    return NOTIFICATION_TOKEN_KEYS.map((key) => ({cssVar: tokenKeyToCssVar(key), key}));
  }

  public get previewVariant(): NdwuNotificationVariant {
    return this.sandboxForm.controls.variant.value;
  }

  public get previewMessage(): string {
    return this.sandboxForm.controls.message.value;
  }

  protected getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement;
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      variant: NOTIFICATION_VARIANT.INFO,
      message: 'This is a notification message',
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return Object.fromEntries(NOTIFICATION_TOKEN_KEYS.map((key) => [key, '']));
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

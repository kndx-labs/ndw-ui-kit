import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  BUTTON_VARIANT,
  type ButtonVariant,
  type IconName,
  NdwuButtonComponent,
  SIZE,
  type Size,
} from '@ndw-ui-kit/core';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {CssUtils} from '@app/utils';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';
import {
  BUTTON_TOKEN_KEYS,
  BUTTON_TYPE_LOADER_KEYS,
  BUTTON_TYPE_TO_PREFIX,
  SANDBOX_ICONS,
} from './button-sandbox.constants';

function tokenKeyToCssVar(key: string): string {
  return CssUtils.tokenKeyToCssVar(key);
}

@Component({
  selector: 'app-button-sandbox',
  templateUrl: './button-sandbox.component.html',
  styleUrl: './button-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuButtonComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class ButtonSandboxComponent extends SandboxBaseComponent {
  public readonly BUTTON_TYPE = BUTTON_VARIANT;
  public readonly SIZE = SIZE;
  public readonly SANDBOX_ICONS = SANDBOX_ICONS;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly sandboxForm = new FormGroup({
    label: new FormControl<string>('Button', {nonNullable: true}),
    variant: new FormControl<ButtonVariant>(BUTTON_VARIANT.PRIMARY, {nonNullable: true}),
    size: new FormControl<Size>(SIZE.XL, {nonNullable: true}),
    icon: new FormControl<IconName | null>(null),
    isDisabled: new FormControl<boolean>(false, {nonNullable: true}),
    isLoading: new FormControl<boolean>(false, {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      BUTTON_TOKEN_KEYS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ) as Record<(typeof BUTTON_TOKEN_KEYS)[number], FormControl<string>>,
  );

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  protected override readonly tokenMapping: TokenMapping[] = BUTTON_TOKEN_KEYS.map((key) => ({
    key,
    cssVar: tokenKeyToCssVar(key),
  }));

  public tokenListForCurrentType(): readonly TokenListItem[] {
    const variant = this.sandboxForm.controls.variant.value;
    const prefix = BUTTON_TYPE_TO_PREFIX[variant];
    const loaderKeys = BUTTON_TYPE_LOADER_KEYS[variant];

    return BUTTON_TOKEN_KEYS.filter(
      (key) => key.startsWith(prefix) || loaderKeys.includes(key),
    ).map((key) => ({cssVar: tokenKeyToCssVar(key), key}));
  }

  protected getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement;
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      label: 'Button',
      variant: BUTTON_VARIANT.PRIMARY,
      size: SIZE.XL,
      icon: null,
      isDisabled: false,
      isLoading: false,
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return Object.fromEntries(BUTTON_TOKEN_KEYS.map((key) => [key, '']));
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NDWU_ICON_BUTTON_VARIANT,
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NdwuIconButtonComponent,
  type NdwuIconButtonVariant,
  type NdwuIconName,
  type NdwuSize,
} from '@ndw-ui-kit/core';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {CssUtils} from '@app/utils';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';
import {ICON_BUTTON_TOKENS, ICON_BUTTON_VARIANT_OPTIONS, ICON_NAMES} from './icon-button-sandbox.constants';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';

function tokenKeyToCssVar(key: string): string {
  return CssUtils.tokenKeyToCssVar(key);
}

@Component({
  selector: 'app-icon-button-sandbox',
  templateUrl: './icon-button-sandbox.component.html',
  styleUrl: './icon-button-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuIconButtonComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class IconButtonSandboxComponent extends SandboxBaseComponent {
  public readonly SIZE = NDWU_SIZE;
  public readonly ICON_BUTTON_VARIANT = NDWU_ICON_BUTTON_VARIANT;

  public readonly ICON_BUTTON_VARIANT_OPTIONS = ICON_BUTTON_VARIANT_OPTIONS;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  public readonly ICONS = ICON_NAMES;

  public readonly sandboxForm = new FormGroup({
    variant: new FormControl<NdwuIconButtonVariant>(NDWU_ICON_BUTTON_VARIANT.SQUARE, {nonNullable: true}),
    size: new FormControl<NdwuSize>(NDWU_SIZE.L, {nonNullable: true}),
    icon: new FormControl<NdwuIconName>(NDWU_ICON_NAME.CHECK_S, {nonNullable: true}),
    isDisabled: new FormControl<boolean>(false, {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      ICON_BUTTON_TOKENS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ),
  );

  protected override readonly tokenMapping: TokenMapping[] = ICON_BUTTON_TOKENS.map((key) => ({
    key,
    cssVar: tokenKeyToCssVar(key),
  }));

  public tokenListForCurrentType(): readonly TokenListItem[] {
    const variant = this.sandboxForm.controls.variant.value;

    return ICON_BUTTON_TOKENS
      .filter(
        (key) => {
          const isFlatVariant = variant === NDWU_ICON_BUTTON_VARIANT.FLAT;
          const isFlatToken = key.startsWith('icon-button-flat');

          return isFlatVariant === isFlatToken;
        },
      )
      .map((key) => ({cssVar: tokenKeyToCssVar(key), key}));
  }

  protected getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement;
  }

  protected override onInit(): void {
    this.sandboxForm.controls.variant.valueChanges.subscribe((variant) => {
      if (variant === NDWU_ICON_BUTTON_VARIANT.FLAT) {
        this.sandboxForm.controls.size.disable();
      } else {
        this.sandboxForm.controls.size.enable();
      }
    });
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      variant: NDWU_ICON_BUTTON_VARIANT.SQUARE,
      size: NDWU_SIZE.L,
      icon: NDWU_ICON_NAME.ADD_S,
      isDisabled: false,
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return Object.fromEntries(ICON_BUTTON_TOKENS.map((key) => [key, '']));
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

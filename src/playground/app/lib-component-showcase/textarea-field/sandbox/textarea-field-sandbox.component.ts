import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NDWU_SIZE, NdwuIconButtonComponent, type NdwuSize, NdwuTextareaActionsDirective} from '@ndw-ui-kit/core';
import {NdwuTextareaFieldComponent} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {CssUtils} from '@app/utils';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

const TEXTAREA_TOKENS = [
  'textarea-field-gutter-bg',
  'textarea-field-gutter-border-color',
  'textarea-field-gutter-text',
  'textarea-field-resizer-color',
] as const;

const DEFAULT_FORM_VALUES = {
  value: 'This is a textarea',
  label: 'Label',
  placeholder: 'Enter text',
  hint: 'This is helper text',
  size: NDWU_SIZE.XL,
  isRequired: false,
  isDisabled: false,
  isReadonly: false,
  isResizable: true,
  showLineNumbers: false,
  showActions: false,
};

const DEFAULT_TOKEN_VALUES = Object.fromEntries(TEXTAREA_TOKENS.map((key) => [key, '']));

@Component({
  selector: 'app-textarea-field-sandbox',
  templateUrl: './textarea-field-sandbox.component.html',
  styleUrl: './textarea-field-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuIconButtonComponent,
    NdwuTextareaActionsDirective,
    NdwuTextareaFieldComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class TextareaFieldSandboxComponent extends SandboxBaseComponent {
  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly SIZE_OPTIONS = [
    {id: NDWU_SIZE.L, label: 'L'},
    {id: NDWU_SIZE.XL, label: 'XL'},
    {id: NDWU_SIZE.XXL, label: 'XXL'},
  ];

  public readonly tokenList: readonly TokenListItem[] = TEXTAREA_TOKENS.map((key) => ({
    cssVar: CssUtils.tokenKeyToCssVar(key),
    key,
  }));

  public readonly sandboxForm = new FormGroup({
    value: new FormControl<string>(DEFAULT_FORM_VALUES.value, {nonNullable: true}),
    label: new FormControl<string>(DEFAULT_FORM_VALUES.label, {nonNullable: true}),
    placeholder: new FormControl<string>(DEFAULT_FORM_VALUES.placeholder, {nonNullable: true}),
    hint: new FormControl<string>(DEFAULT_FORM_VALUES.hint, {nonNullable: true}),
    size: new FormControl<NdwuSize>(DEFAULT_FORM_VALUES.size, {nonNullable: true}),
    isRequired: new FormControl<boolean>(DEFAULT_FORM_VALUES.isRequired, {nonNullable: true}),
    isDisabled: new FormControl<boolean>(DEFAULT_FORM_VALUES.isDisabled, {nonNullable: true}),
    isReadonly: new FormControl<boolean>(DEFAULT_FORM_VALUES.isReadonly, {nonNullable: true}),
    isResizable: new FormControl<boolean>(DEFAULT_FORM_VALUES.isResizable, {nonNullable: true}),
    showLineNumbers: new FormControl<boolean>(DEFAULT_FORM_VALUES.showLineNumbers, {nonNullable: true}),
    showActions: new FormControl<boolean>(DEFAULT_FORM_VALUES.showActions, {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      TEXTAREA_TOKENS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ) as Record<(typeof TEXTAREA_TOKENS)[number], FormControl<string>>,
  );

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  protected override readonly tokenMapping: TokenMapping[] = TEXTAREA_TOKENS.map((key) => ({
    key,
    cssVar: CssUtils.tokenKeyToCssVar(key),
  }));

  public getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement?.querySelector('ndwu-textarea-field') as HTMLElement | undefined;
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return DEFAULT_FORM_VALUES;
  }

  protected override getTokenResetValues(): Record<string, string> {
    return DEFAULT_TOKEN_VALUES;
  }

  public override resetSandbox(): void {
    super.resetSandbox();
    this.applySandboxDisabled();
  }

  protected override onInit(): void {
    this.applySandboxDisabled();

    this.sandboxForm.controls.isDisabled.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applySandboxDisabled());
  }

  private applySandboxDisabled(): void {
    const valueCtrl = this.sandboxForm.controls.value;

    if (this.sandboxForm.controls.isDisabled.value) {
      valueCtrl.disable({emitEvent: false});

      return;
    }

    valueCtrl.enable({emitEvent: false});
  }
}

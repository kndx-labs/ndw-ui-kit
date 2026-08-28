import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NdwuButtonComponent,
  type NdwuPopoverAlign,
  type NdwuPopoverButton,
  NdwuPopoverDirective,
  type NdwuPopoverSide,
} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

const POPOVER_COLOR_TOKENS = [
  'popover-bg',
  'popover-border-color',
  'popover-text-color',
  'popover-header-text-color',
] as const;

const TOKEN_TO_CSS_VAR: Record<string, string> = {
  'popover-bg': '--ndwu-popover-bg',
  'popover-border-color': '--ndwu-popover-border-color',
  'popover-text-color': '--ndwu-popover-text-color',
  'popover-header-text-color': '--ndwu-popover-header-text-color',
};

const OVERLAY_PANEL_CLASS = 'ndwu-popover';

type ButtonFormGroup = FormGroup<{
  label: FormControl<string>;
  primary: FormControl<boolean>;
}>;

@Component({
  selector: 'app-popover-sandbox',
  templateUrl: './popover-sandbox.component.html',
  styleUrl: './popover-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LocalizePipe,
    NdwuButtonComponent,
    NdwuPopoverDirective,
    ReactiveFormsModule,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class PopoverSandboxComponent extends SandboxBaseComponent {
  protected readonly popoverSideOptions: NdwuPopoverSide[] = ['top', 'right', 'bottom', 'left'];
  protected readonly popoverAlignOptions: NdwuPopoverAlign[] = ['start', 'center', 'end'];

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');
  private readonly overlayObserver = new MutationObserver(() => {
    this.applyOverlayTokenStyles();
    this.scheduleTokenPickerRefresh();
  });

  public readonly sandboxForm = new FormGroup({
    content: new FormControl<string>(
      'This is a popover with helpful information about the feature.',
      {
        nonNullable: true,
      },
    ),
    title: new FormControl<string>('Help', {nonNullable: true}),
    showHeader: new FormControl<boolean>(true, {nonNullable: true}),
    showClose: new FormControl<boolean>(true, {nonNullable: true}),
    side: new FormControl<NdwuPopoverSide>('bottom', {nonNullable: true}),
    align: new FormControl<NdwuPopoverAlign>('center', {nonNullable: true}),
    buttons: new FormArray<ButtonFormGroup>([]),
  });

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      POPOVER_COLOR_TOKENS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ) as Record<(typeof POPOVER_COLOR_TOKENS)[number], FormControl<string>>,
  );

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  protected override readonly tokenMapping: TokenMapping[] = POPOVER_COLOR_TOKENS.map((key) => ({
    key,
    cssVar: TOKEN_TO_CSS_VAR[key] ?? '',
  }));

  public get buttonGroups(): ButtonFormGroup[] {
    return this.sandboxForm.controls.buttons.controls;
  }

  public get buttons(): NdwuPopoverButton[] {
    return this.sandboxForm.controls.buttons.controls.map((group: ButtonFormGroup) => ({
      label: group.controls.label.value,
      primary: group.controls.primary.value,
    }));
  }

  public addButton(): void {
    const group = new FormGroup({
      label: new FormControl<string>(`Button ${this.sandboxForm.controls.buttons.length + 1}`, {nonNullable: true}),
      primary: new FormControl<boolean>(false, {nonNullable: true}),
    }) as ButtonFormGroup;

    this.sandboxForm.controls.buttons.push(group);
  }

  public removeButton(index: number): void {
    this.sandboxForm.controls.buttons.removeAt(index);
  }

  public tokenListForCurrentType(): readonly TokenListItem[] {
    return POPOVER_COLOR_TOKENS.map((key) => ({
      cssVar: TOKEN_TO_CSS_VAR[key] ?? '',
      key,
    }));
  }

  protected override getPreviewElement(): HTMLElement | undefined {
    return this.getOverlayPane() ?? this.previewSurface()?.nativeElement;
  }

  protected override onTokenStylesComputed(): void {
    this.applyOverlayTokenStyles();
  }

  protected override onAfterViewInit(): void {
    this.overlayObserver.observe(document.body, {childList: true, subtree: true});
    this.destroyRef.onDestroy(() => this.overlayObserver.disconnect());
    this.applyOverlayTokenStyles();
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      content: 'This is a popover with helpful information about the feature.',
      title: 'Help',
      showHeader: true,
      showClose: true,
      side: 'bottom',
      align: 'center',
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return Object.fromEntries(POPOVER_COLOR_TOKENS.map((key) => [key, '']));
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }

  private getOverlayPane(): HTMLElement | undefined {
    return document.querySelector<HTMLElement>(`.cdk-overlay-pane.${OVERLAY_PANEL_CLASS}`) ?? undefined;
  }

  private applyOverlayTokenStyles(): void {
    const pane = this.getOverlayPane();

    if (!pane) {
      return;
    }

    const values = this.sandboxTokens.getRawValue() as Record<string, unknown>;

    for (const {key, cssVar} of this.tokenMapping) {
      const rawValue = values[key];
      const value = typeof rawValue === 'string' ? rawValue.trim() : '';

      if (value.length) {
        pane.style.setProperty(cssVar, value);
      } else {
        pane.style.removeProperty(cssVar);
      }
    }
  }
}

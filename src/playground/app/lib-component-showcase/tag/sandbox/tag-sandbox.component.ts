import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {merge} from 'rxjs';
import {
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NDWU_TAG_STATUS,
  type NdwuIconName,
  type NdwuSize,
  NdwuTagComponent,
  type NdwuTagStatus,
} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {CssUtils} from '@app/utils';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

const TAG_COLOR_TOKENS = [
  'tag-override-bg',
  'tag-override-border',
  'tag-override-fg',
] as const;

const TAG_STATUS_OPTIONS: NdwuTagStatus[] = Object.values(NDWU_TAG_STATUS);

const TAG_ICON_OPTIONS: NdwuIconName[] = [
  NDWU_ICON_NAME.MENU_DRAG_S,
  NDWU_ICON_NAME.ROUTER_S,
  NDWU_ICON_NAME.INFO_S,
  NDWU_ICON_NAME.WARNING_S,
];

const TOKEN_TO_CSS_VAR: Record<string, string> = {
  'tag-override-bg': '--ndwu-tag-override-bg',
  'tag-override-border': '--ndwu-tag-override-border',
  'tag-override-fg': '--ndwu-tag-override-fg',
};

const TOKEN_TO_READ_CSS_VAR: Record<string, string> = {
  'tag-override-bg': '--ndwu-tag-bg',
  'tag-override-border': '--ndwu-tag-border',
  'tag-override-fg': '--ndwu-tag-fg',
};

const TOKEN_TO_READ_SELECTED_CSS_VAR: Record<string, string> = {
  'tag-override-bg': '--ndwu-tag-selected-bg',
  'tag-override-border': '--ndwu-tag-selected-border',
  'tag-override-fg': '--ndwu-tag-selected-fg',
};

const DEFAULT_LABEL = 'Tag name';

function tokenKeyToCssVar(key: string): string {
  return CssUtils.tokenKeyToCssVar(key);
}

@Component({
  selector: 'app-tag-sandbox',
  templateUrl: './tag-sandbox.component.html',
  styleUrl: './tag-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuTagComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class TagSandboxComponent extends SandboxBaseComponent {
  public readonly SIZE = NDWU_SIZE;
  public readonly TAG_STATUS_OPTIONS = TAG_STATUS_OPTIONS;
  public readonly TAG_ICON_OPTIONS = TAG_ICON_OPTIONS;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly removedCount = signal(0);

  public readonly sandboxForm = new FormGroup({
    label: new FormControl<string>(DEFAULT_LABEL, {nonNullable: true}),
    status: new FormControl<NdwuTagStatus>(NDWU_TAG_STATUS.DEFAULT, {nonNullable: true}),
    size: new FormControl<NdwuSize>(NDWU_SIZE.XL, {nonNullable: true}),
    icon: new FormControl<NdwuIconName | null>(NDWU_ICON_NAME.MENU_DRAG_S, {nonNullable: true}),
    selectable: new FormControl<boolean>(true, {nonNullable: true}),
    selected: new FormControl<boolean>(false, {nonNullable: true}),
    removable: new FormControl<boolean>(true, {nonNullable: true}),
    disabled: new FormControl<boolean>(false, {nonNullable: true}),
    ariaLabel: new FormControl<string>('', {nonNullable: true}),
    maxWidth: new FormControl<string>('', {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      TAG_COLOR_TOKENS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ) as Record<(typeof TAG_COLOR_TOKENS)[number], FormControl<string>>,
  );

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  protected override get tokenMapping(): TokenMapping[] {
    const {selectable, selected} = this.sandboxForm.controls;
    const readCssVars = selectable.value && selected.value ? TOKEN_TO_READ_SELECTED_CSS_VAR : TOKEN_TO_READ_CSS_VAR;

    return TAG_COLOR_TOKENS.map((key) => ({
      key,
      cssVar: TOKEN_TO_CSS_VAR[key] ?? '',
      readCssVar: readCssVars[key],
    }));
  }

  public tokenListForCurrentType(): readonly TokenListItem[] {
    return TAG_COLOR_TOKENS.map((key) => ({
      cssVar: tokenKeyToCssVar(key),
      key,
    }));
  }

  public onSelectedChange(selected: boolean): void {
    this.sandboxForm.controls.selected.setValue(selected);
  }

  public onRemoved(): void {
    this.removedCount.update((count) => count + 1);
  }

  protected override getPreviewElement(): HTMLElement | undefined {
    const surfaceEl = this.previewSurface()?.nativeElement;

    return surfaceEl?.querySelector('button[ndwu-tag]') as HTMLElement | undefined;
  }

  protected override onInit(): void {
    this.sandboxForm.controls.status.valueChanges.subscribe(() => {
      this.sandboxTokens.reset(this.getTokenResetValues());
    });

    merge(this.sandboxForm.controls.selectable.valueChanges, this.sandboxForm.controls.selected.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.scheduleTokenPickerRefresh());
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      label: DEFAULT_LABEL,
      status: NDWU_TAG_STATUS.DEFAULT,
      size: NDWU_SIZE.XL,
      icon: NDWU_ICON_NAME.MENU_DRAG_S,
      selectable: true,
      selected: false,
      removable: true,
      disabled: false,
      ariaLabel: '',
      maxWidth: '',
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return Object.fromEntries(TAG_COLOR_TOKENS.map((key) => [key, '']));
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }

  public override resetSandbox(): void {
    super.resetSandbox();
    this.removedCount.set(0);
  }
}

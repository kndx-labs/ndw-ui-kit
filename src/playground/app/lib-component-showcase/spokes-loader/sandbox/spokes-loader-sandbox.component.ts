import {ChangeDetectionStrategy, Component, ElementRef, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NdwuSpokesLoaderComponent} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent, TokenListComponent, type TokenListItem} from '@app/components';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';

const COLOR_VAR = '--ndwu-spokes-loader-color';
const DEFAULT_COLOR = '#8E8E93';

const DEFAULT_FORM_VALUES = {
  size: 20,
  spokes: 8,
  duration: 900,
  spokeWidth: 1.5,
  spokeHeight: '',
  spokeOffset: '',
  autostart: true,
};

@Component({
  selector: 'app-spokes-loader-sandbox',
  templateUrl: './spokes-loader-sandbox.component.html',
  styleUrl: './spokes-loader-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuSpokesLoaderComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class SpokesLoaderSandboxComponent extends SandboxBaseComponent {
  public readonly tokenList: readonly TokenListItem[] = [
    {cssVar: COLOR_VAR, key: 'spokesLoaderColor'},
  ];

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly sandboxForm = new FormGroup({
    size: new FormControl<number>(0, {nonNullable: true}),
    spokes: new FormControl<number>(0, {nonNullable: true}),
    duration: new FormControl<number>(0, {nonNullable: true}),
    spokeWidth: new FormControl<number>(0, {nonNullable: true}),
    spokeHeight: new FormControl<number | string>('', {nonNullable: true}),
    spokeOffset: new FormControl<number | string>('', {nonNullable: true}),
    autostart: new FormControl<boolean>(true, {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup({
    spokesLoaderColor: new FormControl<string>('', {nonNullable: true}),
  });

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  protected override readonly tokenMapping: TokenMapping[] = [
    {key: 'spokesLoaderColor', cssVar: COLOR_VAR, defaultColor: DEFAULT_COLOR},
  ];

  public getSpokeHeightValue(): number | undefined {
    const v = this.sandboxForm.controls.spokeHeight.value;

    if (v === '' || v === null || v === undefined) {
      return undefined;
    }

    const n = Number(v);

    return Number.isFinite(n) ? n : undefined;
  }

  public getSpokeOffsetValue(): number | null {
    const v = this.sandboxForm.controls.spokeOffset.value;

    if (v === '' || v === null || v === undefined) {
      return null;
    }

    const n = Number(v);

    return Number.isFinite(n) ? n : null;
  }

  protected getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement;
  }

  protected override onInit(): void {
    this.sandboxForm.setValue(DEFAULT_FORM_VALUES);
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return DEFAULT_FORM_VALUES;
  }

  protected override getTokenResetValues(): Record<string, string> {
    return {spokesLoaderColor: ''};
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }
}

import {ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {type NdwuSize, NdwuTimingButtonComponent, SIZE} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ThemeSwitcherComponent, TokenListComponent} from '@app/components';
import {CssUtils} from '@app/utils';
import {SandboxBaseComponent, type TokenMapping} from '@app/lib-component-showcase/sandbox-base.component';
import {TIMING_BUTTON_TOKEN_KEYS} from './timing-button-sandbox.constants';

export type TimingButtonSandboxState =
  | 'preloading'
  | 'default'
  | 'hover'
  | 'focus'
  | 'pressed'
  | 'disabled'
  | 'loading';

function tokenKeyToCssVar(key: string): string {
  return CssUtils.tokenKeyToCssVar(key);
}

@Component({
  selector: 'app-timing-button-sandbox',
  templateUrl: './timing-button-sandbox.component.html',
  styleUrl: './timing-button-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NdwuTimingButtonComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    TokenListComponent,
  ],
})
export class TimingButtonSandboxComponent extends SandboxBaseComponent {
  public readonly SIZE = SIZE;

  private readonly previewSurface = viewChild<ElementRef<HTMLElement>>('previewSurface');

  public readonly tokenListForCurrentType = computed(() =>
    TIMING_BUTTON_TOKEN_KEYS.map((key) => ({cssVar: tokenKeyToCssVar(key), key}))
  );

  public readonly sandboxForm = new FormGroup({
    leftText: new FormControl<string>('Button', {nonNullable: true}),
    rightText: new FormControl<string>('s', {nonNullable: true}),
    size: new FormControl<NdwuSize>(SIZE.XL, {nonNullable: true}),
    state: new FormControl<TimingButtonSandboxState>('default', {nonNullable: true}),
    duration: new FormControl<number>(15, {nonNullable: true}),
  });

  public readonly sandboxTokens = new FormGroup(
    Object.fromEntries(
      TIMING_BUTTON_TOKEN_KEYS.map((key) => [key, new FormControl<string>('', {nonNullable: true})]),
    ) as Record<(typeof TIMING_BUTTON_TOKEN_KEYS)[number], FormControl<string>>,
  );

  public readonly sandboxTokenStyles = signal<Record<string, string | null>>({});

  public readonly tokenPickerValues = signal<Record<string, string>>({});

  public readonly timerEndCount = signal<number>(0);
  public readonly sandboxButtonKey = signal<number>(0);
  public readonly sandboxButtonVisible = signal<boolean>(true);

  protected override readonly tokenMapping: TokenMapping[] = TIMING_BUTTON_TOKEN_KEYS.map((key) => ({
    key,
    cssVar: tokenKeyToCssVar(key),
  }));

  public onTimerEnd(): void {
    this.timerEndCount.update((n) => n + 1);
    this.sandboxForm.controls.state.setValue('loading');
    setTimeout(() => {
      this.sandboxForm.controls.state.setValue('default');
      this.sandboxButtonVisible.set(false);
      setTimeout(() => this.sandboxButtonVisible.set(true));
    }, 2000);
  }

  protected getPreviewElement(): HTMLElement | undefined {
    return this.previewSurface()?.nativeElement;
  }

  protected override getDefaultFormValues(): Record<string, unknown> {
    return {
      leftText: 'Button',
      rightText: 's',
      size: SIZE.XL,
      state: 'default',
      duration: 15,
    };
  }

  protected override getTokenResetValues(): Record<string, string> {
    return Object.fromEntries(TIMING_BUTTON_TOKEN_KEYS.map((key) => [key, '']));
  }

  protected override getSandboxThemeDefault(): string {
    return 'light';
  }

  public override resetSandbox(): void {
    this.timerEndCount.set(0);
    this.sandboxButtonVisible.set(false);
    this.sandboxButtonKey.update((k) => k + 1);
    super.resetSandbox();
  }
}

import {type FormGroup} from '@angular/forms';
import {AfterViewInit, DestroyRef, Directive, OnInit, type WritableSignal, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CssUtils} from '@app/utils';

export interface TokenMapping {
  key: string;
  cssVar: string;
  readCssVar?: string | undefined;
  defaultColor?: string | undefined;
}

@Directive({
  selector: '[appSandboxBase]',
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class SandboxBaseComponent implements OnInit, AfterViewInit {
  protected readonly destroyRef = inject(DestroyRef);

  public readonly sandboxTheme: WritableSignal<string>;

  protected abstract readonly tokenMapping: TokenMapping[];
  protected abstract readonly sandboxTokens: FormGroup;
  protected abstract readonly sandboxTokenStyles: WritableSignal<Record<string, string | null>>;
  protected abstract readonly tokenPickerValues: WritableSignal<Record<string, string>>;
  protected abstract readonly sandboxForm: FormGroup;

  protected abstract getPreviewElement(): HTMLElement | undefined;

  protected getDefaultFormValues(): Record<string, unknown> {
    return {};
  }

  protected getTokenResetValues(): Record<string, string> {
    return {};
  }

  protected getSandboxThemeDefault(): string {
    return 'light';
  }

  protected onTokenStylesComputed(): void {}

  protected onAfterViewInit(): void {}

  protected onInit(): void {}

  constructor() {
    this.sandboxTheme = signal(this.getSandboxThemeDefault());
  }

  public ngOnInit(): void {
    this.computeSandboxTokenStyles();
    this.setupTokenSubscription();
    this.onInit();
  }

  public ngAfterViewInit(): void {
    this.scheduleTokenPickerRefresh();
    this.onAfterViewInit();
  }

  protected computeSandboxTokenStyles(): void {
    const values = this.sandboxTokens.getRawValue() as Record<string, unknown>;
    const styles: Record<string, string | null> = {};

    for (const {key, cssVar} of this.tokenMapping) {
      const val = values[key];

      if (typeof val === 'string') {
        styles[cssVar] = val.trim().length ? val.trim() : null;
      }
    }

    this.sandboxTokenStyles.set(styles);
    this.scheduleTokenPickerRefresh();
    this.onTokenStylesComputed();
  }

  protected scheduleTokenPickerRefresh(): void {
    queueMicrotask(() => this.refreshTokenPickerValues());
  }

  protected refreshTokenPickerValues(): void {
    const el = this.getPreviewElement();

    if (!el) {
      return;
    }

    const overrides = this.sandboxTokens.getRawValue() as Record<string, unknown>;
    const next: Record<string, string> = {};

    for (const {key, cssVar, readCssVar, defaultColor} of this.tokenMapping) {
      const rawOverride = overrides[key];
      const override = typeof rawOverride === 'string' ? rawOverride.trim() : '';

      if (override.length) {
        next[key] = override;
      } else {
        const varToRead = readCssVar ?? cssVar;
        const resolved = CssUtils.resolveColorForPicker(varToRead, el);

        next[key] = resolved ?? defaultColor ?? '#000000';
      }
    }

    this.tokenPickerValues.set(next);
  }

  public setSandboxTheme(theme: string): void {
    this.sandboxTheme.set(theme);
    this.scheduleTokenPickerRefresh();
  }

  protected setupTokenSubscription(): void {
    this.sandboxTokens.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.computeSandboxTokenStyles());
  }

  public resetSandbox(): void {
    this.sandboxTheme.set(this.getSandboxThemeDefault());

    const defaultFormValues = this.getDefaultFormValues();

    if (defaultFormValues) {
      this.sandboxForm.reset(defaultFormValues);
    }

    const tokenReset = this.getTokenResetValues();

    if (tokenReset) {
      this.sandboxTokens.reset(tokenReset);
    }

    this.computeSandboxTokenStyles();
  }
}

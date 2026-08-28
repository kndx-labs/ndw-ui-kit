import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
// noinspection ES6PreferShortImport
import {ThemeSwitcherComponent} from '../theme-switcher/theme-switcher.component';

export type SandboxWidthMode = 'stretch' | 'fixed';

const MIN_WIDTH_PX = 100;
const MAX_WIDTH_PX = 600;
const DEFAULT_WIDTH_PX = Math.floor((MAX_WIDTH_PX + MIN_WIDTH_PX) / 2);

export const STRETCH_WIDTH_VALUE = '100%';

@Component({
  selector: 'app-sandbox-toolbar',
  templateUrl: './sandbox-toolbar.component.html',
  styleUrl: './sandbox-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ThemeSwitcherComponent,
    LocalizePipe,
  ],
})
export class SandboxToolbarComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  public readonly theme = input.required<string>();
  public readonly widthPxMin = input<number>(MIN_WIDTH_PX);
  public readonly widthPxMax = input<number>(MAX_WIDTH_PX);

  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(result => result.matches),
    ),
    {initialValue: this.breakpointObserver.isMatched(Breakpoints.Handset)},
  );

  public readonly widthMode = signal<SandboxWidthMode>('fixed');
  public readonly widthPx = signal<number>(DEFAULT_WIDTH_PX);

  public readonly clampedWidthPx = computed(() => {
    return Math.max(
      this.widthPxMin(),
      Math.min(this.widthPxMax(), this.widthPx()),
    );
  });

  public readonly width = computed(() => {
    if (this.isMobile() || this.widthMode() === 'stretch') {
      return STRETCH_WIDTH_VALUE;
    }

    return `${this.clampedWidthPx()}px`;
  });

  public readonly themeChange = output<string>();
  public readonly widthChange = output<string>();
  public readonly resetClick = output<void>();

  constructor() {
    // Keep widthPx clamped to valid range
    effect(() => {
      const current = this.widthPx();
      const clamped = this.clampedWidthPx();

      if (current !== clamped) {
        this.widthPx.set(clamped);
      }
    });

    let prevMobile = this.isMobile();

    // Re-emit width when viewport crosses the mobile/desktop boundary
    effect(() => {
      const mobile = this.isMobile();

      if (mobile !== prevMobile) {
        prevMobile = mobile;
        untracked(() => this.widthChange.emit(this.width()));
      }
    });
  }

  public onWidthModeChange(value: string): void {
    const newMode = value as SandboxWidthMode;

    this.widthMode.set(newMode);
    this.widthChange.emit(this.width());
  }

  public onWidthPxInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);

    if (!Number.isNaN(value)) {
      this.widthPx.set(value);
      this.widthChange.emit(this.width());
    }
  }

  public onReset(): void {
    this.widthMode.set('fixed');
    this.widthPx.set(DEFAULT_WIDTH_PX);
    this.widthChange.emit(this.width());
    this.resetClick.emit();
  }
}

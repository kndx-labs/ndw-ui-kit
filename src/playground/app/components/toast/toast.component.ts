import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {NDWU_NOTIFICATION_VARIANT, NdwuNotificationComponent} from '@ndw-ui-kit/core';

const HIDE_DELAY_MS = 4000;

/**
 * Fixed-position toast for playground demos: shows the given message
 * and hides itself after a delay.
 */
@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuNotificationComponent,
  ],
})
export class ToastComponent {
  protected readonly NOTIFICATION_VARIANT = NDWU_NOTIFICATION_VARIANT;
  protected readonly message = signal<string | null>(null);

  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  public show(message: string): void {
    this.clearTimer();
    this.message.set(message);

    this.hideTimer = setTimeout(() => this.message.set(null), HIDE_DELAY_MS);
  }

  /**
   * Prevents the native submit and shows the submitted `FormData` entries.
   */
  public showFormData(event: SubmitEvent): void {
    event.preventDefault();

    const entries = [...new FormData(event.target as HTMLFormElement).entries()]
      .map(([key, value]) => `${key}=${typeof value === 'string' ? value : value.name}`);

    this.show(entries.length ? `FormData: ${entries.join(', ')}` : 'common.form-data-empty');
  }

  private clearTimer(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);

      this.hideTimer = null;
    }
  }
}

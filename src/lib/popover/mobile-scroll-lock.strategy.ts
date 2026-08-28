import type {ScrollStrategy} from '@angular/cdk/overlay';

/**
 * Scroll strategy that locks scrolling via overflow:hidden on <html> and <body>
 * instead of position:fixed. Avoids the full-page re-composite on mobile Safari.
 */
export class MobileScrollLockStrategy implements ScrollStrategy {
  private static activeCount = 0;
  private static savedHtmlOverflow = '';
  private static savedBodyOverflow = '';

  private isActive = false;

  public attach(): void {
  }

  public enable(): void {
    if (this.isActive) {
      return;
    }

    this.isActive = true;

    if (MobileScrollLockStrategy.activeCount === 0) {
      const html = document.documentElement;
      const body = document.body;

      MobileScrollLockStrategy.savedHtmlOverflow = html.style.overflow;
      MobileScrollLockStrategy.savedBodyOverflow = body.style.overflow;
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    }

    MobileScrollLockStrategy.activeCount++;
  }

  public disable(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    MobileScrollLockStrategy.activeCount--;

    if (MobileScrollLockStrategy.activeCount === 0) {
      document.documentElement.style.overflow = MobileScrollLockStrategy.savedHtmlOverflow;
      document.body.style.overflow = MobileScrollLockStrategy.savedBodyOverflow;
    }
  }
}

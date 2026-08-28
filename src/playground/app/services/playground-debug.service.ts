import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlaygroundDebugService {
  private static readonly TAP_AREAS_KEY = 'ndwu-debug-tap-areas';
  private static readonly INTERACTION_PANEL_KEY = 'ndwu-debug-interaction-panel';

  public readonly showTapAreas = signal(this.readBoolean(PlaygroundDebugService.TAP_AREAS_KEY));
  public readonly showInteractionPanel = signal(this.readBoolean(PlaygroundDebugService.INTERACTION_PANEL_KEY));

  public toggleTapAreas(): void {
    this.showTapAreas.update((current) => {
      const next = !current;

      this.writeBoolean(PlaygroundDebugService.TAP_AREAS_KEY, next);

      return next;
    });
  }

  public setTapAreas(value: boolean): void {
    this.writeBoolean(PlaygroundDebugService.TAP_AREAS_KEY, value);
    this.showTapAreas.set(value);
  }

  public toggleInteractionPanel(): void {
    this.showInteractionPanel.update((current) => {
      const next = !current;

      this.writeBoolean(PlaygroundDebugService.INTERACTION_PANEL_KEY, next);

      return next;
    });
  }

  public setInteractionPanel(value: boolean): void {
    this.writeBoolean(PlaygroundDebugService.INTERACTION_PANEL_KEY, value);
    this.showInteractionPanel.set(value);
  }

  private readBoolean(key: string): boolean {
    try {
      return localStorage.getItem(key) === 'true';
    } catch {
      return false;
    }
  }

  private writeBoolean(key: string, value: boolean): void {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // ignore storage write failures in playground.
    }
  }
}

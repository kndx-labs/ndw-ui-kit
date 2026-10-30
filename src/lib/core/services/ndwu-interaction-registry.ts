import {Injectable, type Signal, type WritableSignal, computed, signal} from '@angular/core';
import {NdwuValues} from '../../shared.types';

export const NDWU_INTERACTION_FOCUS_TYPE = {
  CHECKBOX: 'checkbox',
  FILE_UPLOAD: 'file-upload',
  INPUT: 'input',
  RADIO: 'radio',
  SELECT: 'select',
  TOGGLE: 'toggle',
} as const;

export type NdwuInteractionFocusType = NdwuValues<typeof NDWU_INTERACTION_FOCUS_TYPE>;

export const NDWU_INTERACTION_FOCUS_TYPES: NdwuInteractionFocusType[] = [
  NDWU_INTERACTION_FOCUS_TYPE.CHECKBOX,
  NDWU_INTERACTION_FOCUS_TYPE.FILE_UPLOAD,
  NDWU_INTERACTION_FOCUS_TYPE.INPUT,
  NDWU_INTERACTION_FOCUS_TYPE.RADIO,
  NDWU_INTERACTION_FOCUS_TYPE.SELECT,
  NDWU_INTERACTION_FOCUS_TYPE.TOGGLE,
] as const;

@Injectable({
  providedIn: 'root',
})
export class NdwuInteractionRegistry {
  private readonly focusedIdsByType: Record<NdwuInteractionFocusType, WritableSignal<ReadonlySet<string>>> = {
    [NDWU_INTERACTION_FOCUS_TYPE.CHECKBOX]: signal<ReadonlySet<string>>(new Set()),
    [NDWU_INTERACTION_FOCUS_TYPE.FILE_UPLOAD]: signal<ReadonlySet<string>>(new Set()),
    [NDWU_INTERACTION_FOCUS_TYPE.INPUT]: signal<ReadonlySet<string>>(new Set()),
    [NDWU_INTERACTION_FOCUS_TYPE.RADIO]: signal<ReadonlySet<string>>(new Set()),
    [NDWU_INTERACTION_FOCUS_TYPE.SELECT]: signal<ReadonlySet<string>>(new Set()),
    [NDWU_INTERACTION_FOCUS_TYPE.TOGGLE]: signal<ReadonlySet<string>>(new Set()),
  };
  private readonly blockingOverlayIds = signal<ReadonlySet<string>>(new Set());
  private readonly focusedControlSignals = new Map<string, Signal<boolean>>();

  /** Whether any keyboard-owning overlay (for example select / multiselect) is currently open. */
  public readonly hasBlockingOverlay = computed(() => this.blockingOverlayIds().size > 0);

  public getFocusedStateSignal(
    types: NdwuInteractionFocusType | readonly NdwuInteractionFocusType[],
  ): Signal<boolean> {
    const normalizedTypes = this.normalizeFocusTypes(types);
    const cacheKey = normalizedTypes.join('|');
    const cachedSignal = this.focusedControlSignals.get(cacheKey);

    if (cachedSignal) {
      return cachedSignal;
    }

    const focusedSignal = computed(() => {
      return normalizedTypes.some(type => this.focusedIdsByType[type]().size > 0);
    });

    this.focusedControlSignals.set(cacheKey, focusedSignal);

    return focusedSignal;
  }

  public setFocused(type: NdwuInteractionFocusType, id: string, focused: boolean): void {
    this.updatePresence(this.focusedIdsByType[type], id, focused);
  }

  public setOverlayOpen(id: string, open: boolean): void {
    this.updatePresence(this.blockingOverlayIds, id, open);
  }

  private normalizeFocusTypes(
    types: NdwuInteractionFocusType | readonly NdwuInteractionFocusType[],
  ): readonly NdwuInteractionFocusType[] {
    const requestedTypes = new Set(Array.isArray(types) ? types : [types]);

    return NDWU_INTERACTION_FOCUS_TYPES.filter(type => requestedTypes.has(type));
  }

  private updatePresence(
    state: WritableSignal<ReadonlySet<string>>,
    id: string,
    present: boolean,
  ): void {
    state.update((current) => {
      if (present) {
        if (current.has(id)) {
          return current;
        }

        return new Set(current).add(id);
      }

      if (!current.has(id)) {
        return current;
      }

      const next = new Set(current);

      next.delete(id);

      return next;
    });
  }
}

import {Directive, model} from '@angular/core';

export type NdwuSortDirection = 'asc' | 'desc' | '';

export interface NdwuSortState {
  active: string;
  direction: NdwuSortDirection;
}

@Directive({
  selector: '[ndwuSort]',
  exportAs: 'ndwuSort',
})
export class NdwuSortDirective {
  public readonly state = model<NdwuSortState>({active: '', direction: ''}, {alias: 'ndwuSort'});

  public sort(id: string): void {
    const {active, direction} = this.state();

    if (active !== id) {
      this.state.set({active: id, direction: 'asc'});

      return;
    }

    const next = this.nextDirection(direction);

    this.state.set({active: next === '' ? '' : id, direction: next});
  }

  private nextDirection(current: NdwuSortDirection): NdwuSortDirection {
    if (current === 'asc') {
      return 'desc';
    }

    if (current === 'desc') {
      return '';
    }

    return 'asc';
  }
}

import {Directive, model, output} from '@angular/core';

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
  public readonly active = model('', {alias: 'ndwuSortActive'});
  public readonly direction = model<NdwuSortDirection>('', {alias: 'ndwuSortDirection'});

  public readonly ndwuSortChange = output<NdwuSortState>();

  public sort(id: string): void {
    if (this.active() === id) {
      const next = this.nextDirection(this.direction());

      this.direction.set(next);

      if (next === '') {
        this.active.set('');
      }
    } else {
      this.active.set(id);
      this.direction.set('asc');
    }

    this.ndwuSortChange.emit({active: this.active(), direction: this.direction()});
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

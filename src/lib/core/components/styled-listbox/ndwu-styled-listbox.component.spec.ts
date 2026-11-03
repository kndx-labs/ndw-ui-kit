import {ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {NdwuStyledListboxComponent} from './ndwu-styled-listbox.component';
import {NdwuStyledOptionComponent} from './ndwu-styled-option.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuStyledListboxComponent, NdwuStyledOptionComponent],
  template: `
    <ndwu-styled-listbox size="L" [maxVisibleOptions]="n()">
      <ndwu-styled-option value="a" label="A">A</ndwu-styled-option>
      <ndwu-styled-option value="b" label="B">B</ndwu-styled-option>
    </ndwu-styled-listbox>
  `,
})
class StyledListboxTestHostComponent {
  public readonly n = signal<number | null>(5);
}

class TestResizeObserver implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}

  public observe(_target: Element, _options?: ResizeObserverOptions): void {}

  public unobserve(_target: Element): void {}

  public disconnect(): void {}
}

function createMatchMedia(matches: boolean): (query: string) => MediaQueryList {
  return (query) => {
    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    } as MediaQueryList;
  };
}

describe('NdwuStyledListboxComponent', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    vi.stubGlobal('matchMedia', createMatchMedia(false));

    TestBed.configureTestingModule({
      imports: [StyledListboxTestHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('sets max height for a positive finite visible option count', () => {
    const fixture = TestBed.createComponent(StyledListboxTestHostComponent);

    fixture.detectChanges();

    const listbox = fixture.nativeElement.querySelector('ndwu-styled-listbox') as HTMLElement;

    expect(listbox.style.getPropertyValue('--ndwu-styled-listbox-max-height'))
      .toBe('calc(5 * var(--ndwu-styled-option-height))');
  });

  it('leaves size default for null, zero, negative, and non-finite values', () => {
    const fixture = TestBed.createComponent(StyledListboxTestHostComponent);
    const listbox = (): HTMLElement => fixture.nativeElement.querySelector('ndwu-styled-listbox') as HTMLElement;

    fixture.detectChanges();

    for (const value of [null, 0, -2, Number.NaN]) {
      fixture.componentInstance.n.set(value);
      fixture.detectChanges();

      expect(listbox().style.getPropertyValue('--ndwu-styled-listbox-max-height')).toBe('');
    }
  });

  it('clears max height when the visible option count changes to null', () => {
    const fixture = TestBed.createComponent(StyledListboxTestHostComponent);

    fixture.detectChanges();
    fixture.componentInstance.n.set(null);
    fixture.detectChanges();

    const listbox = fixture.nativeElement.querySelector('ndwu-styled-listbox') as HTMLElement;

    expect(listbox.style.getPropertyValue('--ndwu-styled-listbox-max-height')).toBe('');
  });
});

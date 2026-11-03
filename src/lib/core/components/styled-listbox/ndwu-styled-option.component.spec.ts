import {ChangeDetectionStrategy, Component, provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {NdwuStyledListboxComponent} from './ndwu-styled-listbox.component';
import {NdwuStyledOptionComponent} from './ndwu-styled-option.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuStyledListboxComponent, NdwuStyledOptionComponent],
  template: `
    <ndwu-styled-listbox size="L">
      <ndwu-styled-option value="danger" label="Danger" variant="danger">Danger</ndwu-styled-option>
      <ndwu-styled-option value="default" label="Default">Default</ndwu-styled-option>
    </ndwu-styled-listbox>
  `,
})
class StyledOptionTestHostComponent {}

class TestResizeObserver implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}

  public observe(_target: Element, _options?: ResizeObserverOptions): void {}

  public unobserve(_target: Element): void {}

  public disconnect(): void {}
}

function createMatchMedia(matches: boolean): (query: string) => MediaQueryList {
  return (query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  } as MediaQueryList);
}

describe('NdwuStyledOptionComponent', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    vi.stubGlobal('matchMedia', createMatchMedia(false));

    TestBed.configureTestingModule({
      imports: [StyledOptionTestHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('adds the danger class only for danger variants', () => {
    const fixture = TestBed.createComponent(StyledOptionTestHostComponent);

    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('ndwu-styled-option') as NodeListOf<HTMLElement>;

    expect(options[0]!.classList).toContain('ndwu-styled-option--danger');
    expect(options[1]!.classList).not.toContain('ndwu-styled-option--danger');
  });
});

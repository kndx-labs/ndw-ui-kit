import {ChangeDetectionStrategy, Component, provideZonelessChangeDetection} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TestBed, type ComponentFixture} from '@angular/core/testing';
import {NdwuSelectFieldComponent} from './ndwu-select-field.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NdwuSelectFieldComponent],
  template: `
    <ndwu-select-field [options]="opts" [formControl]="ctrl" />
  `,
})
class SelectFieldTestHostComponent {
  public readonly opts = [
    {value: 'a', label: 'A'},
    {value: 'b', label: 'B', variant: 'danger' as const},
    {value: 'c', label: 'C', disabled: true},
  ];

  public readonly ctrl = new FormControl<string | number>('a');
}

class TestResizeObserver implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}

  public observe(_target: Element, _options?: ResizeObserverOptions): void {}

  public unobserve(_target: Element): void {}

  public disconnect(): void {}
}

const originalScrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');

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

async function openPanel(fixture: ComponentFixture<SelectFieldTestHostComponent>): Promise<void> {
  const trigger = fixture.nativeElement.querySelector('.ndwu-select-field__trigger') as HTMLElement;

  trigger.click();
  fixture.detectChanges();
  await fixture.whenStable();

  if (trigger.getAttribute('aria-expanded') !== 'true') {
    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
    fixture.detectChanges();
    await fixture.whenStable();
  }
}

describe('NdwuSelectFieldComponent option state', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    vi.stubGlobal('matchMedia', createMatchMedia(false));
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });

    TestBed.configureTestingModule({
      imports: [SelectFieldTestHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();

    if (originalScrollIntoView) {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScrollIntoView);
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
    }
  });

  it('renders danger and disabled options with their respective state', async () => {
    const fixture = TestBed.createComponent(SelectFieldTestHostComponent);

    fixture.detectChanges();
    await openPanel(fixture);

    const options = document.body.querySelectorAll('ndwu-styled-option') as NodeListOf<HTMLElement>;

    expect(options).toHaveLength(3);
    expect(options[1]!.classList).toContain('ndwu-styled-option--danger');
    expect(options[2]!.getAttribute('aria-disabled')).toBe('true');
    expect(options[2]!.classList).toContain('ndwu-styled-option--disabled');
  });
});

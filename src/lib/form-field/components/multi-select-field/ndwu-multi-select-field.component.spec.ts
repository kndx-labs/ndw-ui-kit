import {ChangeDetectionStrategy, Component, provideZonelessChangeDetection} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {NdwuOptionTemplateDirective} from '@ndw-ui-kit/core';
import {NdwuMultiSelectFieldComponent} from './ndwu-multi-select-field.component';

interface MultiSelectOptionTemplateItem {
  value: string;
  label: string;
  code: string;
  hidden?: boolean;
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NdwuMultiSelectFieldComponent, NdwuOptionTemplateDirective],
  template: `
    <ndwu-multi-select-field [options]="opts" [formControl]="ctrl">
      <ng-template
        [ndwuOptionTemplate]="opts"
        let-option
        let-raw="raw"
        let-label="label"
        let-selected="selected"
      >
        <span class="custom">{{ raw?.code }}|{{ label }}|{{ selected }}</span>
      </ng-template>
    </ndwu-multi-select-field>
  `,
})
class MultiSelectFieldOptionTemplateTestHostComponent {
  public readonly opts: readonly MultiSelectOptionTemplateItem[] = [
    {value: 'h', label: 'H', code: 'hh', hidden: true},
    {value: 'a', label: 'A', code: 'aa'},
    {value: 'b', label: 'B', code: 'bb'},
  ];

  public readonly ctrl = new FormControl<string[]>(['a']);
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

async function openPanel(fixture: ComponentFixture<MultiSelectFieldOptionTemplateTestHostComponent>): Promise<void> {
  const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
    '.ndwu-multi-select-field__trigger',
  );

  if (!trigger) {
    throw new Error('Multi-select field trigger not found.');
  }

  trigger.click();
  fixture.detectChanges();
  await fixture.whenStable();

  if (trigger.getAttribute('aria-expanded') !== 'true') {
    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
    fixture.detectChanges();
    await fixture.whenStable();
  }
}

describe('NdwuMultiSelectFieldComponent option template', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    vi.stubGlobal('matchMedia', createMatchMedia(false));
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });

    TestBed.configureTestingModule({
      imports: [MultiSelectFieldOptionTemplateTestHostComponent],
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

  it('renders custom content beside the checkbox and updates selected context', async () => {
    const fixture = TestBed.createComponent(MultiSelectFieldOptionTemplateTestHostComponent);

    fixture.detectChanges();
    await openPanel(fixture);

    const options = [...document.body.querySelectorAll<HTMLElement>('ndwu-styled-option')];

    expect(options).toHaveLength(2);
    expect(options.every((option) => option.querySelector('.ndwu-multi-select-field__option-checkbox ndwu-checkbox')))
      .toBe(true);
    expect([...document.body.querySelectorAll<HTMLElement>('.custom')].map((element) => element.textContent?.trim()))
      .toEqual(['aa|A|true', 'bb|B|false']);

    const secondOption = options.at(1);

    if (!secondOption) {
      throw new Error('Second select option not found.');
    }

    secondOption.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const secondCustomOption = [...document.body.querySelectorAll<HTMLElement>('.custom')].at(1);

    expect(secondCustomOption?.textContent?.trim()).toBe('bb|B|true');
  });
});

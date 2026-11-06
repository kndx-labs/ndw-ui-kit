import {ChangeDetectionStrategy, Component, provideZonelessChangeDetection} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {type NdwuAutocompleteOption, NdwuOptionTemplateDirective} from '@ndw-ui-kit/core';
import {NdwuAutocompleteFieldComponent} from './ndwu-autocomplete-field.component';

interface AutocompleteTestOption extends NdwuAutocompleteOption {
  icon?: string;
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuAutocompleteFieldComponent, NdwuOptionTemplateDirective],
  template: `
    <ndwu-autocomplete-field
      [options]="options"
      [localizeLabels]="false"
      [maxVisibleOptions]="maxVisibleOptions"
      (optionSelected)="selected = $event"
    >
      @if (showTemplate) {
        <ng-template
          [ndwuOptionTemplate]="options"
          let-option
          let-raw="raw"
          let-label="label"
          let-query="query"
          let-selected="selected"
        >
          <span class="custom">{{ raw?.icon }}|{{ label }}|{{ query }}|{{ selected }}</span>
        </ng-template>
      }
    </ndwu-autocomplete-field>
  `,
})
class AutocompleteFieldTestHostComponent {
  public readonly options: readonly AutocompleteTestOption[] = [
    {value: 'de', label: 'Germany', icon: 'x'},
    {value: 'fr', label: 'France', variant: 'danger'},
    {value: 'it', label: 'Italy'},
  ];
  public showTemplate = true;
  public readonly maxVisibleOptions = 2;
  public selected: NdwuAutocompleteOption | undefined;
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

async function typeQuery(
  fixture: ComponentFixture<AutocompleteFieldTestHostComponent>,
  query: string,
): Promise<HTMLInputElement> {
  const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
    '.ndwu-autocomplete__input',
  );

  if (!input) {
    throw new Error('Autocomplete input not found.');
  }

  input.focus();
  input.value = query;
  input.dispatchEvent(new Event('input', {bubbles: true}));
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return input;
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', TestResizeObserver);
  vi.stubGlobal('matchMedia', createMatchMedia(false));
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });

  TestBed.configureTestingModule({
    imports: [AutocompleteFieldTestHostComponent],
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

describe('NdwuAutocompleteFieldComponent option template', () => {
  it('renders template context with original option and trimmed query', async () => {
    const fixture = TestBed.createComponent(AutocompleteFieldTestHostComponent);

    fixture.detectChanges();
    await typeQuery(fixture, ' Ger ');

    const customContent = [...document.body.querySelectorAll<HTMLElement>('.custom')];

    expect(customContent.map((element) => element.textContent?.trim())).toEqual(['x|Germany|Ger|false']);
  });

  it('renders the option label when no template is provided', async () => {
    const fixture = TestBed.createComponent(AutocompleteFieldTestHostComponent);

    fixture.componentInstance.showTemplate = false;
    fixture.detectChanges();
    await typeQuery(fixture, 'Ger');

    const options = document.body.querySelectorAll<HTMLElement>('ndwu-styled-option');

    expect(options).toHaveLength(1);
    expect(options.item(0).textContent?.trim()).toBe('Germany');
  });

  it('passes danger and maxVisibleOptions to the styled listbox', async () => {
    const fixture = TestBed.createComponent(AutocompleteFieldTestHostComponent);

    fixture.detectChanges();
    await typeQuery(fixture, 'Fra');

    const option = document.body.querySelector<HTMLElement>('ndwu-styled-option');
    const listbox = document.body.querySelector<HTMLElement>('ndwu-styled-listbox');

    expect(option?.classList).toContain('ndwu-styled-option--danger');
    expect(listbox?.style.getPropertyValue('--ndwu-styled-listbox-max-height')).toBe(
      'calc(2 * var(--ndwu-styled-option-height))',
    );
  });

  it('emits the original option when selected through the template', async () => {
    const fixture = TestBed.createComponent(AutocompleteFieldTestHostComponent);

    fixture.detectChanges();
    await typeQuery(fixture, 'Ger');

    const option = document.body.querySelector<HTMLElement>('ndwu-styled-option');

    if (!option) {
      throw new Error('Autocomplete option not found.');
    }

    option.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.selected).toBe(fixture.componentInstance.options[0]);
  });
});

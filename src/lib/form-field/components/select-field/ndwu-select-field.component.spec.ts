import {ChangeDetectionStrategy, Component, provideZonelessChangeDetection} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {NdwuOptionTemplateDirective, type NdwuOption} from '@ndw-ui-kit/core';
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
  public opts: NdwuOption[] = [
    {value: 'a', label: 'A'},
    {value: 'b', label: 'B', variant: 'danger'},
    {value: 'c', label: 'C', disabled: true},
  ];

  public readonly ctrl = new FormControl<string | number>('a');
}

interface SelectOptionTemplateItem {
  value: string;
  label: string;
  code: string;
  hidden?: boolean;
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NdwuSelectFieldComponent, NdwuOptionTemplateDirective],
  template: `
    <ndwu-select-field [options]="opts" [formControl]="ctrl">
      <ng-template
        [ndwuOptionTemplate]="opts"
        let-option
        let-raw="raw"
        let-label="label"
        let-selected="selected"
      >
        <span class="custom">{{ raw?.code }}|{{ label }}|{{ selected }}</span>
      </ng-template>
    </ndwu-select-field>
  `,
})
class SelectFieldOptionTemplateTestHostComponent {
  public readonly opts: readonly SelectOptionTemplateItem[] = [
    {value: 'h', label: 'H', code: 'hh', hidden: true},
    {value: 'a', label: 'A', code: 'aa'},
    {value: 'b', label: 'B', code: 'bb'},
  ];

  public readonly ctrl = new FormControl<string | number>('b');
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

async function openPanel<T>(fixture: ComponentFixture<T>): Promise<void> {
  const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.ndwu-select-field__trigger');

  if (!trigger) {
    throw new Error('Select field trigger not found.');
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

    const options = document.body.querySelectorAll<HTMLElement>('ndwu-styled-option');

    expect(options).toHaveLength(3);
    expect(options.item(1).classList).toContain('ndwu-styled-option--danger');
    expect(options.item(2).getAttribute('aria-disabled')).toBe('true');
    expect(options.item(2).classList).toContain('ndwu-styled-option--disabled');
  });

  it('keeps the option label as content when no custom template is provided', async () => {
    const fixture = TestBed.createComponent(SelectFieldTestHostComponent);

    fixture.detectChanges();
    await openPanel(fixture);

    const options = document.body.querySelectorAll<HTMLElement>('ndwu-styled-option');

    expect(options.item(0).textContent?.trim()).toBe('A');
  });
});

describe('NdwuSelectFieldComponent disabled option selection', () => {
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

  it('keeps the current value and panel open when a disabled option is clicked', async () => {
    const fixture = TestBed.createComponent(SelectFieldTestHostComponent);

    fixture.componentInstance.opts = [
      {value: 'a', label: 'A'},
      {value: 'b', label: 'B', disabled: true},
      {value: 'c', label: 'C'},
    ];
    fixture.detectChanges();
    await openPanel(fixture);

    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.ndwu-select-field__trigger');
    const disabledOption = document.body.querySelectorAll<HTMLElement>('ndwu-styled-option').item(1);

    if (!trigger) {
      throw new Error('Select field trigger not found.');
    }

    disabledOption.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.ctrl.value).toBe('a');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('skips a disabled option with ArrowDown and selects the next enabled option with Enter', async () => {
    const fixture = TestBed.createComponent(SelectFieldTestHostComponent);

    fixture.componentInstance.opts = [
      {value: 'a', label: 'A'},
      {value: 'b', label: 'B', disabled: true},
      {value: 'c', label: 'C'},
    ];
    fixture.detectChanges();
    await openPanel(fixture);

    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.ndwu-select-field__trigger');
    const [optionA, optionB, optionC] = [...document.body.querySelectorAll<HTMLElement>('ndwu-styled-option')];

    if (!trigger || !optionA || !optionB || !optionC) {
      throw new Error('Select field trigger or options not found.');
    }

    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', keyCode: 40, bubbles: true}));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-activedescendant')).toBe(optionA.id);

    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', keyCode: 40, bubbles: true}));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-activedescendant')).toBe(optionC.id);

    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.ctrl.value).toBe('c');
  });
});

describe('NdwuSelectFieldComponent option template', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    vi.stubGlobal('matchMedia', createMatchMedia(false));
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });

    TestBed.configureTestingModule({
      imports: [SelectFieldOptionTemplateTestHostComponent],
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

  it('provides normalized, raw, localized-label, and selected values while preserving typeahead', async () => {
    const fixture = TestBed.createComponent(SelectFieldOptionTemplateTestHostComponent);

    fixture.detectChanges();
    await openPanel(fixture);

    const customContent = [...document.body.querySelectorAll<HTMLElement>('.custom')];

    expect(customContent.map((element) => element.textContent?.trim())).toEqual(['aa|A|false', 'bb|B|true']);

    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.ndwu-select-field__trigger');
    const optionB = [...document.body.querySelectorAll<HTMLElement>('.custom')]
      .find((content) => content.textContent?.startsWith('bb|'))
      ?.closest<HTMLElement>('ndwu-styled-option');

    if (!trigger || !optionB) {
      throw new Error('Select field trigger or option B not found.');
    }

    trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'b', bubbles: true}));
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 250));
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-activedescendant')).toBe(optionB.id);
  });
});

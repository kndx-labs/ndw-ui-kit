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

interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  hidden?: boolean;
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NdwuMultiSelectFieldComponent],
  template: `
    <ndwu-multi-select-field [options]="opts" [formControl]="ctrl" />
  `,
})
class MultiSelectFieldSelectAllTestHostComponent {
  public opts: readonly MultiSelectOption[] = [
    {value: 'a', label: 'A'},
    {value: 'b', label: 'B', disabled: true},
    {value: 'c', label: 'C', disabled: true},
    {value: 'd', label: 'D'},
    {value: 'e', label: 'E', hidden: true},
  ];

  public readonly ctrl = new FormControl<string[]>([], {nonNullable: true});
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

async function createSelectAllFixture(
  initialValue: string[],
  options?: readonly MultiSelectOption[],
): Promise<ComponentFixture<MultiSelectFieldSelectAllTestHostComponent>> {
  const fixture = TestBed.createComponent(MultiSelectFieldSelectAllTestHostComponent);

  if (options) {
    fixture.componentInstance.opts = options;
  }

  fixture.componentInstance.ctrl.setValue(initialValue);
  fixture.detectChanges();
  await openPanel(fixture);

  return fixture;
}

function getSelectAllInput(): HTMLInputElement {
  const input = document.body.querySelector<HTMLInputElement>('.ndwu-multi-select-field__select-all input');

  if (!input) {
    throw new Error('Select all checkbox input not found.');
  }

  return input;
}

async function setSelectAllChecked<T>(fixture: ComponentFixture<T>, checked: boolean): Promise<HTMLInputElement> {
  const input = getSelectAllInput();

  input.checked = checked;
  input.dispatchEvent(new Event('change', {bubbles: true}));
  fixture.detectChanges();
  await fixture.whenStable();

  return input;
}

async function confirmSelection<T>(fixture: ComponentFixture<T>): Promise<void> {
  const button = document.body.querySelector<HTMLButtonElement>('.ndwu-multi-select-field__footer button');

  if (!button) {
    throw new Error('Confirm button not found.');
  }

  button.click();
  fixture.detectChanges();
  await fixture.whenStable();
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

describe('NdwuMultiSelectFieldComponent select all', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    vi.stubGlobal('matchMedia', createMatchMedia(true));
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });

    TestBed.configureTestingModule({
      imports: [MultiSelectFieldSelectAllTestHostComponent],
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

  it('adds interactive values while preserving disabled selection and order', async () => {
    const fixture = await createSelectAllFixture(['c']);
    const selectAllInput = await setSelectAllChecked(fixture, true);
    const optionCheckboxes = [
      ...document.body.querySelectorAll<HTMLInputElement>('ndwu-styled-option ndwu-checkbox input'),
    ];

    expect(optionCheckboxes.map((input) => input.checked)).toEqual([true, false, true, true]);
    expect(selectAllInput.checked).toBe(true);

    await confirmSelection(fixture);

    expect(fixture.componentInstance.ctrl.value).toEqual(['c', 'a', 'd']);
  });

  it('removes only interactive values when unchecked', async () => {
    const fixture = await createSelectAllFixture(['a', 'c', 'e']);

    await setSelectAllChecked(fixture, false);
    await confirmSelection(fixture);

    expect(fixture.componentInstance.ctrl.value).toEqual(['c', 'e']);
  });

  it('preserves unknown values when unchecked', async () => {
    const fixture = await createSelectAllFixture(['unknown']);

    await setSelectAllChecked(fixture, false);
    await confirmSelection(fixture);

    expect(fixture.componentInstance.ctrl.value).toEqual(['unknown']);
  });

  it('checks select all when every interactive value is selected', async () => {
    await createSelectAllFixture(['a', 'd']);

    const selectAllInput = getSelectAllInput();

    expect(selectAllInput.checked).toBe(true);
    expect(selectAllInput.indeterminate).toBe(false);
  });

  it('marks select all indeterminate for partial interactive selection', async () => {
    await createSelectAllFixture(['a']);

    const selectAllInput = getSelectAllInput();

    expect(selectAllInput.checked).toBe(false);
    expect(selectAllInput.indeterminate).toBe(true);
  });

  it('stays determinate when only disabled values are selected', async () => {
    await createSelectAllFixture(['c']);

    const selectAllInput = getSelectAllInput();

    expect(selectAllInput.checked).toBe(false);
    expect(selectAllInput.indeterminate).toBe(false);
  });

  it('stays determinate when no interactive options exist', async () => {
    await createSelectAllFixture(['b'], [
      {value: 'b', label: 'B', disabled: true},
      {value: 'e', label: 'E', hidden: true},
    ]);

    const selectAllInput = getSelectAllInput();

    expect(selectAllInput.checked).toBe(false);
    expect(selectAllInput.indeterminate).toBe(false);
  });
});

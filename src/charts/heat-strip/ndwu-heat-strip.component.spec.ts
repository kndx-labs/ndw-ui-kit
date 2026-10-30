import {ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {NdwuHeatStripMarkerDirective, NdwuHeatStripTooltipDirective} from './ndwu-heat-strip-templates.directive';
import type {NdwuHeatStripCell} from './ndwu-heat-strip.types';
import {NdwuHeatStripComponent} from './ndwu-heat-strip.component';

interface TooltipTestData {
  id: string;
  name: string;
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

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuHeatStripComponent, NdwuHeatStripTooltipDirective, NdwuHeatStripMarkerDirective],
  template: `
    <ndwu-heat-strip [cells]="cells()" [loading]="loading()">
      <ng-template [ndwuHeatStripTooltip]="cells()" let-cell let-index="index">
        {{ index }}:{{ cell.data?.name }}
      </ng-template>
      <ng-template [ndwuHeatStripMarker]="cells()" let-cell>
        {{ cell.data?.name }}
      </ng-template>
    </ndwu-heat-strip>
  `,
})
class HeatStripTooltipTestHostComponent {
  public readonly cells = signal<readonly NdwuHeatStripCell<TooltipTestData>[]>([
    {level: 0, data: {id: 'a', name: 'a'}},
    {level: 1, data: {id: 'b', name: 'b'}},
    {level: 2, data: {id: 'c', name: 'c'}},
    {level: 3, data: {id: 'd', name: 'd'}},
  ]);
  public readonly loading = signal(false);
}

function createStrip(cells: readonly NdwuHeatStripCell[]): ComponentFixture<NdwuHeatStripComponent> {
  const fixture = TestBed.createComponent(NdwuHeatStripComponent);

  fixture.componentRef.setInput('cells', cells);
  fixture.detectChanges();

  return fixture;
}

function rootElement<T>(fixture: ComponentFixture<T>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function stripElement(fixture: ComponentFixture<NdwuHeatStripComponent>): HTMLElement {
  const strip = rootElement(fixture).querySelector('.ndwu-heat-strip__strip');

  if (!(strip instanceof HTMLElement)) {
    throw new Error('Heat strip element was not rendered.');
  }

  return strip;
}

function cellElements(fixture: ComponentFixture<NdwuHeatStripComponent>): HTMLElement[] {
  return Array.from(rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell'));
}

function tabIndexes(fixture: ComponentFixture<NdwuHeatStripComponent>): number[] {
  return cellElements(fixture).map((element) => Number(element.getAttribute('tabindex')));
}

function press(fixture: ComponentFixture<NdwuHeatStripComponent>, key: string): void {
  const activeElement = document.activeElement;

  activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true}));
  fixture.detectChanges();
}

function createTooltipHost(): ComponentFixture<HeatStripTooltipTestHostComponent> {
  const fixture = TestBed.createComponent(HeatStripTooltipTestHostComponent);

  fixture.detectChanges();

  return fixture;
}

function tooltipElement(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="tooltip"]');
}

function heatStripStyles(): string {
  const styleElement = Array.from(document.querySelectorAll('style')).find((style) => {
    return style.textContent?.includes('ndwu-heat-strip__cell') ?? false;
  });

  if (styleElement?.sheet === null || styleElement?.sheet === undefined) {
    throw new Error('Heat strip styles were not loaded.');
  }

  return styleElement.textContent ?? '';
}

function styleValue(
  styles: string,
  selectorPart: string,
  property: string,
  forcedColors = false,
  selectorSuffix = '',
): string {
  let searchStart = 0;

  while (true) {
    const selectorStart = styles.indexOf(selectorPart, searchStart);

    if (selectorStart === -1) {
      return '';
    }

    searchStart = selectorStart + selectorPart.length;

    const nextCharacter = styles[searchStart];

    if (nextCharacter !== undefined && /[\w-]/u.test(nextCharacter)) {
      continue;
    }

    const ruleStart = styles.indexOf('{', searchStart);
    const ruleEnd = styles.indexOf('}', ruleStart);

    if (ruleStart === -1 || ruleEnd === -1) {
      return '';
    }

    const selector = styles.slice(selectorStart, ruleStart);
    const lastForcedColorsMedia = styles.lastIndexOf('@media (forced-colors: active)', selectorStart);
    const lastClosedBlock = styles.lastIndexOf('}', selectorStart);
    const isForcedColorsRule = lastForcedColorsMedia > lastClosedBlock;

    if (isForcedColorsRule === forcedColors && selector.includes(selectorSuffix)) {
      const declarations = styles.slice(ruleStart + 1, ruleEnd);
      const declaration = declarations.match(new RegExp(`(?:^|\\n)\\s*${property}:\\s*([^;]+);`, 'u'));

      if (declaration?.[1] !== undefined) {
        return declaration[1].trim().toLowerCase();
      }
    }
  }
}

describe('NdwuHeatStripComponent', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    vi.stubGlobal('matchMedia', createMatchMedia(false));

    TestBed.configureTestingModule({
      imports: [NdwuHeatStripComponent, HeatStripTooltipTestHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders one cell per item with level and no-data modifiers', () => {
    const fixture = createStrip([{level: 0}, {level: 5}, {level: null}]);

    expect(cellElements(fixture)[0]?.classList.contains('ndwu-heat-strip__cell--level-0')).toBe(true);
    expect(cellElements(fixture)[1]?.classList.contains('ndwu-heat-strip__cell--level-5')).toBe(true);
    expect(cellElements(fixture)[2]?.classList.contains('ndwu-heat-strip__cell--no-data')).toBe(true);
  });

  it('renders invalid levels as no-data', () => {
    const cells = [{level: 2.5}, {level: -1}, {level: Number.NaN}, {level: 6}] as unknown as NdwuHeatStripCell[];
    const fixture = createStrip(cells);

    expect(
      cellElements(fixture).every((element) => {
        return element.classList.contains('ndwu-heat-strip__cell--no-data');
      }),
    ).toBe(true);
  });

  it('warns once per cells change', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fixture = createStrip([{level: 2}, {level: 2.5}] as unknown as NdwuHeatStripCell[]);

    fixture.detectChanges();
    fixture.detectChanges();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('[1]');

    fixture.componentRef.setInput('cells', [{level: -1} as unknown as NdwuHeatStripCell]);
    fixture.detectChanges();

    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('marks marker cells', () => {
    const fixture = createStrip([{level: 1, marker: true}]);

    expect(cellElements(fixture)[0]?.classList.contains('ndwu-heat-strip__cell--marker')).toBe(true);
  });

  it('renders empty strip without cells', () => {
    const fixture = createStrip([]);

    expect(stripElement(fixture).classList.contains('ndwu-heat-strip__strip--empty')).toBe(true);
    expect(cellElements(fixture)).toHaveLength(0);
  });

  it('renders no axis by default and ticks + labels with axisLabels', () => {
    const fixture = createStrip([{level: 0}, {level: 1}, {level: 2}, {level: 3}]);

    expect(rootElement(fixture).querySelector('.ndwu-heat-strip__axis')).toBeNull();

    fixture.componentRef.setInput('axisLabels', ['00:00', '00:30', '01:00']);
    fixture.detectChanges();

    expect(rootElement(fixture).querySelectorAll('.ndwu-heat-strip__tick')).toHaveLength(5);
    expect(
      Array.from(rootElement(fixture).querySelectorAll('.ndwu-heat-strip__axis-label')).map((element) => {
        return element.textContent?.trim();
      }),
    ).toEqual(['00:00', '00:30', '01:00']);
    expect(
      rootElement(fixture).querySelector('.ndwu-heat-strip__axis')
        ?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('exposes group, cells as img with default labels', () => {
    const fixture = createStrip([{level: 0}, {level: null}, {level: 3, marker: true}]);

    expect(stripElement(fixture).getAttribute('role')).toBe('group');
    expect(stripElement(fixture).getAttribute('aria-label')).toBe('Heat strip');
    expect(cellElements(fixture).map((element) => element.getAttribute('aria-label')))
      .toEqual(['Level 1', 'No data', 'Level 4, Marked']);
    expect(cellElements(fixture).every((element) => element.getAttribute('role') === 'img')).toBe(true);
  });

  it('uses cellLabel when given', () => {
    const fixture = createStrip([{level: 0}, {level: null}]);

    fixture.componentRef.setInput('cellLabel', (_cell: NdwuHeatStripCell, index: number) => `cell ${index}`);
    fixture.detectChanges();

    expect(cellElements(fixture)[1]?.getAttribute('aria-label')).toBe('cell 1');
  });

  it('describes empty strip with emptyLabel', () => {
    const fixture = createStrip([]);

    fixture.componentRef.setInput('emptyLabel', 'Nothing to show');
    fixture.detectChanges();

    const descriptionId = stripElement(fixture).getAttribute('aria-describedby');
    const description = descriptionId ? document.getElementById(descriptionId) : null;

    expect(description?.textContent?.trim()).toBe('Nothing to show');
  });

  it('keeps one tab stop and moves it with arrows, Home, End', () => {
    const fixture = createStrip([{level: 0}, {level: 1}, {level: 2}, {level: 3}, {level: 4}]);

    cellElements(fixture)[0]?.focus();
    fixture.detectChanges();

    expect(tabIndexes(fixture)).toEqual([0, -1, -1, -1, -1]);
    press(fixture, 'ArrowRight');
    expect(document.activeElement).toBe(cellElements(fixture)[1]);
    press(fixture, 'End');
    expect(document.activeElement).toBe(cellElements(fixture)[4]);
    press(fixture, 'ArrowRight');
    expect(document.activeElement).toBe(cellElements(fixture)[4]);
    press(fixture, 'Home');
    expect(document.activeElement).toBe(cellElements(fixture)[0]);
    expect(tabIndexes(fixture)).toEqual([0, -1, -1, -1, -1]);
  });

  it('ignores navigation keys with modifier keys', () => {
    const fixture = createStrip([{level: 0}, {level: 1}, {level: 2}, {level: 3}]);
    const focusedCell = cellElements(fixture)[1];

    focusedCell?.focus();
    fixture.detectChanges();

    const altArrowRight = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      altKey: true,
      bubbles: true,
      cancelable: true,
    });

    focusedCell?.dispatchEvent(altArrowRight);
    fixture.detectChanges();

    expect(document.activeElement).toBe(focusedCell);
    expect(altArrowRight.defaultPrevented).toBe(false);

    const ctrlEnd = new KeyboardEvent('keydown', {
      key: 'End',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    focusedCell?.dispatchEvent(ctrlEnd);
    fixture.detectChanges();

    expect(document.activeElement).toBe(focusedCell);
    expect(ctrlEnd.defaultPrevented).toBe(false);
  });

  it('swaps arrows in RTL', () => {
    const fixture = createStrip([{level: 0}, {level: 1}, {level: 2}, {level: 3}, {level: 4}]);

    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
      return {direction: 'rtl'} as CSSStyleDeclaration;
    });
    cellElements(fixture)[2]?.focus();
    press(fixture, 'ArrowLeft');

    expect(document.activeElement).toBe(cellElements(fixture)[3]);
  });

  it('clamps the tab stop when cells shrink', () => {
    const fixture = createStrip([{level: 0}, {level: 1}, {level: 2}, {level: 3}, {level: 4}]);

    cellElements(fixture)[4]?.focus();
    fixture.detectChanges();
    fixture.componentRef.setInput('cells', [{level: 0}, {level: 1}]);
    fixture.detectChanges();

    expect(tabIndexes(fixture)).toEqual([-1, 0]);

    fixture.componentRef.setInput('cells', []);
    fixture.detectChanges();
    fixture.componentRef.setInput('cells', [{level: 0}, {level: 1}, {level: 2}]);
    fixture.detectChanges();

    expect(tabIndexes(fixture)).toEqual([-1, -1, 0]);
  });

  it('keeps focus on the same position when cells update', () => {
    const fixture = createStrip([{level: 0}, {level: 1}, {level: 2}, {level: 3}]);
    const focusedCell = cellElements(fixture)[1];

    focusedCell?.focus();
    fixture.detectChanges();
    fixture.componentRef.setInput('cells', [{level: 5}, {level: 4}, {level: 3}, {level: 2}]);
    fixture.detectChanges();

    expect(document.activeElement).toBe(focusedCell);
    expect(tabIndexes(fixture)[1]).toBe(0);
  });

  it('loading moves focus to the strip and keeps the tab stop position', () => {
    const fixture = createStrip([{level: 0}, {level: 1}, {level: 2}, {level: 3}]);

    cellElements(fixture)[2]?.focus();
    fixture.detectChanges();
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(stripElement(fixture).getAttribute('aria-busy')).toBe('true');
    expect(document.activeElement).toBe(stripElement(fixture));
    expect(tabIndexes(fixture).every((tabIndex) => tabIndex === -1)).toBe(true);

    fixture.componentRef.setInput('cells', [{level: 4}, {level: 5}, {level: 0}, {level: 1}]);
    fixture.detectChanges();
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    expect(tabIndexes(fixture)[2]).toBe(0);
  });

  it('restores the tab stop position when loading ends with new cells', () => {
    const fixture = createStrip([{level: 0}, {level: 1}, {level: 2}, {level: 3}]);

    cellElements(fixture)[2]?.focus();
    fixture.detectChanges();
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    fixture.componentRef.setInput('cells', [{level: 4}, {level: 5}, {level: 0}, {level: 1}]);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    expect(tabIndexes(fixture)[2]).toBe(0);
  });

  it('keeps the pre-loading tab stop when cells are cleared while loading', () => {
    const fixture = createStrip([{level: 0}, {level: 1}, {level: 2}, {level: 3}]);

    cellElements(fixture)[3]?.focus();
    fixture.detectChanges();
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    fixture.componentRef.setInput('cells', []);
    fixture.detectChanges();
    fixture.componentRef.setInput('cells', [{level: 0}, {level: 1}]);
    fixture.detectChanges();
    fixture.componentRef.setInput('cells', [{level: 0}, {level: 1}, {level: 2}, {level: 3}]);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    expect(tabIndexes(fixture)).toEqual([-1, -1, -1, 0]);

    const shortFixture = createStrip([{level: 0}, {level: 1}, {level: 2}, {level: 3}]);

    cellElements(shortFixture)[3]?.focus();
    shortFixture.detectChanges();
    shortFixture.componentRef.setInput('loading', true);
    shortFixture.detectChanges();
    shortFixture.componentRef.setInput('cells', []);
    shortFixture.detectChanges();
    shortFixture.componentRef.setInput('cells', [{level: 0}, {level: 1}]);
    shortFixture.componentRef.setInput('loading', false);
    shortFixture.detectChanges();

    expect(tabIndexes(shortFixture)).toEqual([-1, 0]);
  });

  it('ignores cell focus while loading', () => {
    const fixture = createTooltipHost();
    const cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    cells[2]?.focus();
    fixture.detectChanges();
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    cells[1]?.focus();
    fixture.detectChanges();

    expect(tooltipElement()).toBeNull();

    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();

    const updatedCells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    expect(Array.from(updatedCells).map((cell) => Number(cell.getAttribute('tabindex')))).toEqual([-1, -1, 0, -1]);
  });

  it('ignores navigation keys while loading', () => {
    const fixture = createStrip([{level: 0}, {level: 1}, {level: 2}, {level: 3}]);

    cellElements(fixture)[1]?.focus();
    fixture.detectChanges();
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    press(fixture, 'ArrowRight');
    press(fixture, 'End');

    expect(document.activeElement).toBe(stripElement(fixture));
  });

  it('opens tooltip on focus with cell context and describes the active cell', () => {
    const fixture = createTooltipHost();
    const cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    cells[1]?.focus();
    fixture.detectChanges();

    expect(tooltipElement()?.textContent).toContain('1:b');
    expect(cells[1]?.getAttribute('aria-describedby')).toBe(tooltipElement()?.id);
    expect(cells[1]?.classList.contains('ndwu-heat-strip__cell--active')).toBe(true);
  });

  it('reanchors an open tooltip when focus moves between cells', () => {
    const fixture = createTooltipHost();
    const cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    cells[0]?.focus();
    fixture.detectChanges();
    cells[0]?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
    fixture.detectChanges();

    expect(tooltipElement()?.textContent).toContain('1:b');
    expect(cells[0]?.hasAttribute('aria-describedby')).toBe(false);
  });

  it('closes tooltip on Escape without moving focus', () => {
    const fixture = createTooltipHost();
    const cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    cells[1]?.focus();
    fixture.detectChanges();
    cells[1]?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true}));
    fixture.detectChanges();

    expect(tooltipElement()).toBeNull();
    expect(document.activeElement).toBe(cells[1]);
  });

  it('lets Escape propagate when no tooltip is open', () => {
    const fixture = createStrip([{level: 0}]);
    const listener = vi.fn();
    const event = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true});

    document.addEventListener('keydown', listener);
    stripElement(fixture).dispatchEvent(event);
    document.removeEventListener('keydown', listener);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('stops Escape that closed the tooltip', () => {
    const fixture = createTooltipHost();
    const cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');
    const listener = vi.fn();

    cells[1]?.focus();
    fixture.detectChanges();
    document.addEventListener('keydown', listener);
    cells[1]?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true}));
    fixture.detectChanges();
    document.removeEventListener('keydown', listener);

    expect(tooltipElement()).toBeNull();
    expect(listener).not.toHaveBeenCalled();
  });

  it('closes tooltip when focus leaves the strip', () => {
    const fixture = createTooltipHost();
    const cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');
    const outside = document.createElement('button');

    document.body.append(outside);
    cells[0]?.focus();
    fixture.detectChanges();
    outside.focus();
    fixture.detectChanges();

    expect(tooltipElement()).toBeNull();
    outside.remove();
  });

  it('does not open a tooltip without a projected tooltip template', () => {
    const fixture = createStrip([{level: 0}]);

    cellElements(fixture)[0]?.focus();
    fixture.detectChanges();

    expect(tooltipElement()).toBeNull();
  });

  it('opens and closes on delayed pointer enter and leave', () => {
    vi.useFakeTimers();

    const fixture = createTooltipHost();
    const cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');
    const strip = rootElement(fixture).querySelector<HTMLElement>('.ndwu-heat-strip__strip');

    cells[2]?.dispatchEvent(new Event('pointerenter'));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(tooltipElement()?.textContent).toContain('2:c');

    strip?.dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    expect(tooltipElement()).toBeNull();
  });

  it('keeps tooltip open at the same position with new cell data', () => {
    const fixture = createTooltipHost();
    const host = fixture.componentInstance;
    const cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');
    const focusedCell = cells[1];

    focusedCell?.focus();
    fixture.detectChanges();
    host.cells.set([
      {level: 5, data: {id: 'a1', name: 'a1'}},
      {level: 4, data: {id: 'b1', name: 'x'}},
      {level: 3, data: {id: 'c1', name: 'c1'}},
      {level: 2, data: {id: 'd1', name: 'd1'}},
    ]);
    fixture.detectChanges();

    expect(tooltipElement()?.textContent).toContain('1:x');
    expect(document.activeElement).toBe(focusedCell);
  });

  it('tracks the tooltip target separately from the focused tab stop', () => {
    vi.useFakeTimers();

    const fixture = createTooltipHost();
    const host = fixture.componentInstance;
    let cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    cells[1]?.focus();
    fixture.detectChanges();
    cells[3]?.dispatchEvent(new Event('pointerenter'));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(tooltipElement()?.textContent).toContain('3:d');
    expect(document.activeElement).toBe(cells[1]);

    host.cells.set([
      {level: 4, data: {id: 'e', name: 'e'}},
      {level: 3, data: {id: 'd', name: 'd'}},
      {level: 2, data: {id: 'c', name: 'c'}},
      {level: 1, data: {id: 'b', name: 'b'}},
    ]);
    fixture.detectChanges();
    cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    expect(tooltipElement()?.textContent).toContain('3:b');
    expect(document.activeElement).toBe(cells[1]);
    expect(Array.from(cells).map((cell) => Number(cell.getAttribute('tabindex')))).toEqual([-1, 0, -1, -1]);
  });

  it('closes an open tooltip when its target is removed or loading starts', () => {
    const fixture = createTooltipHost();
    const host = fixture.componentInstance;
    let cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    cells[3]?.focus();
    fixture.detectChanges();

    host.cells.set([
      {level: 0, data: {id: 'a', name: 'a'}},
      {level: 2, data: {id: 'c', name: 'c'}},
    ]);
    fixture.detectChanges();

    expect(tooltipElement()).toBeNull();

    cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');
    cells[1]?.focus();
    fixture.detectChanges();
    host.loading.set(true);
    fixture.detectChanges();

    expect(tooltipElement()).toBeNull();
    expect(document.activeElement).toBe(rootElement(fixture).querySelector('.ndwu-heat-strip__strip'));
  });

  it('touch: tap toggles the current tooltip and switches between cells', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    const fixture = createTooltipHost();
    const tap = (cell: HTMLElement | undefined): void => {
      cell?.dispatchEvent(new Event('pointerdown', {bubbles: true}));
      cell?.focus();
      cell?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
      fixture.detectChanges();
    };
    let cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    tap(cells[0]);
    expect(tooltipElement()?.textContent).toContain('0:a');
    tap(cells[0]);
    expect(tooltipElement()).toBeNull();

    tap(cells[0]);
    tap(cells[1]);
    cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    expect(tooltipElement()?.textContent).toContain('1:b');
    expect(cells[0]?.hasAttribute('aria-describedby')).toBe(false);
    expect(cells[1]?.classList.contains('ndwu-heat-strip__cell--active')).toBe(true);
    expect(cells[1]?.getAttribute('aria-describedby')).toBe(tooltipElement()?.id);
  });

  it('touch: tap on the same position after a data update closes the tooltip', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    const fixture = createTooltipHost();
    const tap = (cell: HTMLElement | undefined): void => {
      cell?.dispatchEvent(new Event('pointerdown', {bubbles: true}));
      cell?.focus();
      cell?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
      fixture.detectChanges();
    };
    let cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    tap(cells[0]);
    expect(tooltipElement()?.textContent).toContain('0:a');

    fixture.componentInstance.cells.set([
      {level: 5, data: {id: 'z', name: 'z'}},
      {level: 4, data: {id: 'y', name: 'y'}},
      {level: 3, data: {id: 'x', name: 'x'}},
      {level: 2, data: {id: 'w', name: 'w'}},
    ]);
    fixture.detectChanges();
    cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    expect(tooltipElement()?.textContent).toContain('0:z');

    tap(cells[0]);

    expect(tooltipElement()).toBeNull();
  });

  it('touch: outside pointerdown closes tooltip and detaches its listener', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    const addListener = vi.spyOn(document, 'addEventListener');
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const fixture = createTooltipHost();
    const cell = rootElement(fixture).querySelector<HTMLElement>('.ndwu-heat-strip__cell');

    cell?.dispatchEvent(new Event('pointerdown', {bubbles: true}));
    cell?.focus();
    cell?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    fixture.detectChanges();

    const tooltip = tooltipElement();

    expect(tooltip).not.toBeNull();
    expect(addListener.mock.calls.some(([type]) => type === 'pointerdown')).toBe(true);

    tooltip?.dispatchEvent(new Event('pointerdown', {bubbles: true}));
    fixture.detectChanges();
    expect(tooltipElement()).not.toBeNull();

    document.body.dispatchEvent(new Event('pointerdown', {bubbles: true}));
    fixture.detectChanges();

    expect(tooltipElement()).toBeNull();
    expect(removeListener.mock.calls.some(([type]) => type === 'pointerdown')).toBe(true);
  });

  it('renders marker template only for marked cells', () => {
    const fixture = createTooltipHost();

    fixture.componentInstance.cells.set([
      {level: 0, marker: true, data: {id: 'marked', name: 'marked'}},
      {level: 1, data: {id: 'plain', name: 'plain'}},
    ]);
    fixture.detectChanges();

    const cells = rootElement(fixture).querySelectorAll<HTMLElement>('.ndwu-heat-strip__cell');

    expect(cells[0]?.querySelector('.ndwu-heat-strip__marker')?.textContent?.trim()).toBe('marked');
    expect(cells[1]?.querySelector('.ndwu-heat-strip__marker')).toBeNull();
  });
});

describe('NdwuHeatStripComponent forced-colors styles', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    vi.stubGlobal('matchMedia', createMatchMedia(false));

    TestBed.configureTestingModule({
      imports: [NdwuHeatStripComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('keeps level colors and cell separators in forced-colors mode', () => {
    createStrip([{level: 0}]);

    const styles = heatStripStyles();

    expect(styleValue(styles, '.ndwu-heat-strip__cell', 'forced-color-adjust')).toBe('none');
    expect(styleValue(styles, '.ndwu-heat-strip__cell', 'border-inline-start', true))
      .toBe('1px solid canvastext');
    expect(styleValue(styles, '.ndwu-heat-strip__cell', 'background-color', true)).toBe('');
  });

  it('uses Highlight outlines for active and focused cells in forced-colors mode', () => {
    createStrip([{level: 0}]);

    const styles = heatStripStyles();

    expect(styleValue(styles, '.ndwu-heat-strip__cell--active', 'background-color', true)).toBe('');
    expect(styleValue(styles, '.ndwu-heat-strip__cell--active', 'outline', true))
      .toBe('2px solid highlight');
    expect(styleValue(styles, '.ndwu-heat-strip__cell--active', 'outline-offset', true)).toBe('-2px');
    expect(styleValue(styles, '.ndwu-heat-strip__cell', 'outline', true, ':focus-visible'))
      .toBe('2px solid highlight');
    expect(styleValue(styles, '.ndwu-heat-strip__cell', 'outline-offset', true, ':focus-visible'))
      .toBe('-2px');
    expect(styleValue(styles, '.ndwu-heat-strip__cell', 'box-shadow', true, ':focus-visible'))
      .toBe('none');
  });

  it('lets active Highlight outline override marker outline in forced-colors mode', () => {
    createStrip([{level: 0, marker: true}]);

    const styles = heatStripStyles();

    expect(styleValue(styles, '.ndwu-heat-strip__strip', 'border-color', true)).toBe('canvastext');
    expect(styleValue(styles, '.ndwu-heat-strip__cell--marker', 'outline', true))
      .toBe('2px solid canvastext');
    expect(styleValue(
      styles,
      '.ndwu-heat-strip__cell--active.ndwu-heat-strip__cell--marker',
      'outline',
      true,
    )).toBe('2px solid highlight');
    expect(styleValue(
      styles,
      '.ndwu-heat-strip__cell--active.ndwu-heat-strip__cell--marker',
      'outline-offset',
      true,
    )).toBe('-2px');
  });
});

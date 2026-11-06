import {ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NdwuPopoverTriggerDirective} from '@ndw-ui-kit/core/popover';
import {NdwuTooltipDirective} from './ndwu-tooltip.directive';

class TestResizeObserver implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}

  public observe(_target: Element, _options?: ResizeObserverOptions): void {}

  public unobserve(_target: Element): void {}

  public disconnect(): void {}
}

class TestIntersectionObserver {
  public static readonly instances: TestIntersectionObserver[] = [];
  public readonly observedTargets = new Set<Element>();

  constructor(private readonly callback: IntersectionObserverCallback) {
    TestIntersectionObserver.instances.push(this);
  }

  public observe(target: Element): void {
    this.observedTargets.add(target);
  }

  public unobserve(target: Element): void {
    this.observedTargets.delete(target);
  }

  public disconnect(): void {
    this.observedTargets.clear();
  }

  public report(target: Element, isIntersecting: boolean): void {
    if (!this.observedTargets.has(target)) {
      return;
    }

    const entry = {target, isIntersecting} as IntersectionObserverEntry;

    this.callback([entry], this as unknown as IntersectionObserver);
  }
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
  imports: [NdwuTooltipDirective],
  template: `
    <ng-template #tooltipContent>
      <button type="button">Tooltip action</button>
    </ng-template>
    <button
      id="anchor"
      [ndwuTooltip]="tooltipContent"
      [tooltipOrigin]="origin()"
      triggerOn="manual"
      #tooltip="ndwuTooltip"
    >Anchor</button>
    <button
      id="other"
      type="button"
    >Other</button>
  `,
})
class TooltipTestHostComponent {
  public readonly origin = signal<HTMLElement | null>(null);
}

function createFixture(): ComponentFixture<TooltipTestHostComponent> {
  const fixture = TestBed.createComponent(TooltipTestHostComponent);

  fixture.detectChanges();

  return fixture;
}

function tooltipDirective(fixture: ComponentFixture<TooltipTestHostComponent>): NdwuTooltipDirective {
  const tooltipDebugElement = fixture.debugElement.query(By.directive(NdwuTooltipDirective));

  return tooltipDebugElement.injector.get(NdwuTooltipDirective);
}

function tooltipOpen(fixture: ComponentFixture<TooltipTestHostComponent>): boolean {
  return tooltipDirective(fixture).isOpen();
}

function button(fixture: ComponentFixture<TooltipTestHostComponent>, id: string): HTMLButtonElement {
  const element = (fixture.nativeElement as HTMLElement).querySelector(`#${id}`);

  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`Tooltip button #${id} was not rendered.`);
  }

  return element;
}

function tooltipElement(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="tooltip"]');
}

function reportIntersection(target: Element, isIntersecting: boolean): void {
  const observer = TestIntersectionObserver.instances.at(-1);

  observer?.report(target, isIntersecting);
}

function openTooltip(fixture: ComponentFixture<TooltipTestHostComponent>): void {
  tooltipDirective(fixture).show();
  fixture.detectChanges();
}

function exposesOpenStateThroughShowAndHide(): void {
  const fixture = createFixture();

  expect(tooltipOpen(fixture)).toBe(false);
  openTooltip(fixture);
  expect(tooltipOpen(fixture)).toBe(true);

  tooltipDirective(fixture).hide();
  fixture.detectChanges();

  expect(tooltipOpen(fixture)).toBe(false);
}

function staysOpenWhileHostIntersects(): void {
  const fixture = createFixture();

  openTooltip(fixture);
  reportIntersection(button(fixture, 'anchor'), true);
  fixture.detectChanges();

  expect(tooltipElement()).not.toBeNull();
  expect(tooltipOpen(fixture)).toBe(true);
}

function closesWhenHostLeavesWithoutMovingFocus(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');
  const otherElement = button(fixture, 'other');

  openTooltip(fixture);
  otherElement.focus();
  reportIntersection(anchorElement, false);
  fixture.detectChanges();

  expect(tooltipElement()).toBeNull();
  expect(tooltipOpen(fixture)).toBe(false);
  expect(document.activeElement).toBe(otherElement);
}

function tracksTooltipOriginInsteadOfHost(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');
  const originElement = button(fixture, 'other');

  openTooltip(fixture);
  fixture.componentInstance.origin.set(originElement);
  fixture.detectChanges();

  reportIntersection(anchorElement, false);
  fixture.detectChanges();
  expect(tooltipElement()).not.toBeNull();

  reportIntersection(originElement, false);
  fixture.detectChanges();

  expect(tooltipElement()).toBeNull();
  expect(tooltipOpen(fixture)).toBe(false);
}

function doesNotRestoreFocusToHiddenHostFromPane(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');

  openTooltip(fixture);

  const tooltipButton = tooltipElement()?.querySelector('button');

  if (!(tooltipButton instanceof HTMLButtonElement)) {
    throw new Error('Tooltip button was not rendered.');
  }

  tooltipButton.focus();
  expect(document.activeElement).toBe(tooltipButton);

  reportIntersection(anchorElement, false);
  fixture.detectChanges();

  expect(tooltipElement()).toBeNull();
  expect(document.activeElement).not.toBe(anchorElement);
}

function emitsClosedWhenHostLeavesViewport(): void {
  const fixture = createFixture();
  const trigger = fixture.debugElement.query(By.directive(NdwuTooltipDirective))
    .injector.get(NdwuPopoverTriggerDirective);
  const closed = vi.fn();

  trigger.closed.subscribe(closed);
  openTooltip(fixture);
  reportIntersection(button(fixture, 'anchor'), false);
  fixture.detectChanges();

  expect(closed).toHaveBeenCalledTimes(1);
}

describe('NdwuTooltipDirective', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
    vi.stubGlobal('matchMedia', createMatchMedia(false));
    TestIntersectionObserver.instances.length = 0;

    TestBed.configureTestingModule({
      imports: [TooltipTestHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('exposes open state through show and hide', exposesOpenStateThroughShowAndHide);
  it('stays open while its host intersects the viewport', staysOpenWhileHostIntersects);
  it('closes when its host leaves the viewport without moving focus', closesWhenHostLeavesWithoutMovingFocus);
  it('tracks tooltipOrigin instead of host after reanchoring', tracksTooltipOriginInsteadOfHost);
  it(
    'does not restore focus to the hidden host when focus was inside tooltip',
    doesNotRestoreFocusToHiddenHostFromPane,
  );
  it('emits closed when host leaves the viewport', emitsClosedWhenHostLeavesViewport);
});

import {ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {type NdwuPopoverOrigin, NdwuPopoverTriggerDirective} from '@ndw-ui-kit/core/popover';
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
  public readonly observeCalls: Element[] = [];
  public readonly unobserveCalls: Element[] = [];
  public readonly options: IntersectionObserverInit | undefined;

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.options = options;
    TestIntersectionObserver.instances.push(this);
  }

  public observe(target: Element): void {
    this.observeCalls.push(target);
    this.observedTargets.add(target);
  }

  public unobserve(target: Element): void {
    this.unobserveCalls.push(target);
    this.observedTargets.delete(target);
  }

  public disconnect(): void {
    this.observedTargets.clear();
  }

  public report(target: Element, isIntersecting: boolean): void {
    this.reportMany(target, [isIntersecting]);
  }

  public reportMany(target: Element, isIntersectingValues: readonly boolean[]): void {
    if (!this.observedTargets.has(target)) {
      return;
    }

    const entries = isIntersectingValues.map((isIntersecting) => {
      return {target, isIntersecting} as IntersectionObserverEntry;
    });

    this.callback(entries, this as unknown as IntersectionObserver);
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
      [tooltipRestoreFocus]="tooltipRestoreFocus()"
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
  public readonly origin = signal<NdwuPopoverOrigin | null>(null);
  public readonly tooltipRestoreFocus = signal(true);
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
  reportIntersection(anchorElement, true);
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

  reportIntersection(originElement, true);
  reportIntersection(originElement, false);
  fixture.detectChanges();

  expect(tooltipElement()).toBeNull();
  expect(tooltipOpen(fixture)).toBe(false);
}

function restoresFocusToHiddenHostWithoutScrollingFromPane(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');
  const focus = vi.spyOn(anchorElement, 'focus');

  openTooltip(fixture);

  const tooltipButton = tooltipElement()?.querySelector('button');

  if (!(tooltipButton instanceof HTMLButtonElement)) {
    throw new Error('Tooltip button was not rendered.');
  }

  tooltipButton.focus();
  expect(document.activeElement).toBe(tooltipButton);

  reportIntersection(anchorElement, true);
  reportIntersection(anchorElement, false);
  fixture.detectChanges();

  expect(tooltipElement()).toBeNull();
  expect(document.activeElement).toBe(anchorElement);
  expect(focus).toHaveBeenCalledWith({preventScroll: true});
}

function doesNotRestoreFocusToHiddenHostWhenDisabled(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');
  const focus = vi.spyOn(anchorElement, 'focus');

  fixture.componentInstance.tooltipRestoreFocus.set(false);
  fixture.detectChanges();
  openTooltip(fixture);

  const tooltipButton = tooltipElement()?.querySelector('button');

  if (!(tooltipButton instanceof HTMLButtonElement)) {
    throw new Error('Tooltip button was not rendered.');
  }

  tooltipButton.focus();
  expect(document.activeElement).toBe(tooltipButton);

  reportIntersection(anchorElement, true);
  reportIntersection(anchorElement, false);
  fixture.detectChanges();

  expect(tooltipElement()).toBeNull();
  expect(focus).not.toHaveBeenCalled();
}

function emitsClosedWhenHostLeavesViewport(): void {
  const fixture = createFixture();
  const trigger = fixture.debugElement.query(By.directive(NdwuTooltipDirective))
    .injector.get(NdwuPopoverTriggerDirective);
  const closed = vi.fn();

  trigger.closed.subscribe(closed);
  openTooltip(fixture);
  reportIntersection(button(fixture, 'anchor'), true);
  reportIntersection(button(fixture, 'anchor'), false);
  fixture.detectChanges();

  expect(closed).toHaveBeenCalledTimes(1);
}

function staysOpenWhenOriginIsOutOfViewOnOpen(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');

  openTooltip(fixture);
  reportIntersection(anchorElement, false);
  fixture.detectChanges();

  expect(tooltipElement()).not.toBeNull();
  expect(tooltipOpen(fixture)).toBe(true);
}

function closesAfterOriginIsSeenAndLeaves(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');

  openTooltip(fixture);
  reportIntersection(anchorElement, false);
  reportIntersection(anchorElement, true);
  reportIntersection(anchorElement, false);
  fixture.detectChanges();

  expect(tooltipElement()).toBeNull();
  expect(tooltipOpen(fixture)).toBe(false);
}

function resetsSeenStateAfterOriginChanges(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');
  const originElement = button(fixture, 'other');

  openTooltip(fixture);
  reportIntersection(anchorElement, true);
  fixture.componentInstance.origin.set(originElement);
  fixture.detectChanges();
  reportIntersection(originElement, false);
  fixture.detectChanges();

  expect(tooltipElement()).not.toBeNull();
  expect(tooltipOpen(fixture)).toBe(true);
}

function closesWhenOriginEntersAndLeavesInOneBatch(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');

  openTooltip(fixture);

  const observer = TestIntersectionObserver.instances.at(-1);

  observer?.reportMany(anchorElement, [true, false]);
  fixture.detectChanges();

  expect(tooltipElement()).toBeNull();
  expect(tooltipOpen(fixture)).toBe(false);
}

function observesTriggerHostForPointOrigin(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');

  openTooltip(fixture);
  fixture.componentInstance.origin.set({clientX: 24, clientY: 48});
  fixture.detectChanges();

  const observer = TestIntersectionObserver.instances.at(-1);

  expect(observer?.observedTargets.has(anchorElement)).toBe(true);

  reportIntersection(anchorElement, true);
  reportIntersection(anchorElement, false);
  fixture.detectChanges();

  expect(tooltipElement()).toBeNull();
  expect(tooltipOpen(fixture)).toBe(false);
}

function observesTriggerHostForPointOriginOnOpen(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');

  fixture.componentInstance.origin.set({clientX: 24, clientY: 48});
  fixture.detectChanges();
  openTooltip(fixture);

  const observer = TestIntersectionObserver.instances.at(-1);

  expect(observer?.observedTargets.has(anchorElement)).toBe(true);
}

function observesSameHostAfterCloseAndReopen(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');

  openTooltip(fixture);
  tooltipDirective(fixture).hide();
  fixture.detectChanges();
  openTooltip(fixture);

  const observer = TestIntersectionObserver.instances.at(-1);

  expect(observer?.observeCalls).toEqual([anchorElement]);

  reportIntersection(anchorElement, true);
  reportIntersection(anchorElement, false);
  fixture.detectChanges();

  expect(tooltipElement()).toBeNull();
  expect(tooltipOpen(fixture)).toBe(false);
}

function keepsSeenStateWhenPointOriginChanges(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');

  openTooltip(fixture);
  fixture.componentInstance.origin.set({clientX: 24, clientY: 48});
  fixture.detectChanges();
  reportIntersection(anchorElement, true);

  fixture.componentInstance.origin.set({clientX: 32, clientY: 64});
  fixture.detectChanges();
  reportIntersection(anchorElement, false);
  fixture.detectChanges();

  expect(tooltipElement()).toBeNull();
  expect(tooltipOpen(fixture)).toBe(false);
}

function doesNotChurnHostObservationBetweenPointOrigins(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');

  openTooltip(fixture);

  const observer = TestIntersectionObserver.instances.at(-1);

  fixture.componentInstance.origin.set({clientX: 24, clientY: 48});
  fixture.detectChanges();
  fixture.componentInstance.origin.set({clientX: 32, clientY: 64});
  fixture.detectChanges();

  expect(observer?.observeCalls).toEqual([anchorElement]);
  expect(observer?.unobserveCalls).toEqual([]);
}

function observesTriggerHostAfterSwitchingFromElementToPoint(): void {
  const fixture = createFixture();
  const anchorElement = button(fixture, 'anchor');
  const originElement = button(fixture, 'other');

  openTooltip(fixture);
  fixture.componentInstance.origin.set(originElement);
  fixture.detectChanges();

  const observer = TestIntersectionObserver.instances.at(-1);

  expect(observer?.observedTargets.has(originElement)).toBe(true);
  expect(observer?.observedTargets.has(anchorElement)).toBe(false);

  fixture.componentInstance.origin.set({clientX: 24, clientY: 48});
  fixture.detectChanges();

  expect(observer?.observedTargets.has(originElement)).toBe(false);
  expect(observer?.observedTargets.has(anchorElement)).toBe(true);
}

function readsScrollPaddingFromRootScrollerForRootMargin(): void {
  const scrollingElement = document.scrollingElement ?? document.documentElement;
  const originalGetComputedStyle = window.getComputedStyle.bind(window);
  const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
    const computedStyle = originalGetComputedStyle(element);

    if (element !== scrollingElement) {
      return computedStyle;
    }

    Object.defineProperties(computedStyle, {
      scrollPaddingTop: {value: '64px'},
      scrollPaddingRight: {value: '0px'},
      scrollPaddingBottom: {value: '10%'},
      scrollPaddingLeft: {value: 'auto'},
    });

    return computedStyle;
  });

  openTooltip(createFixture());

  expect(getComputedStyleSpy).toHaveBeenCalledWith(scrollingElement);
  expect(TestIntersectionObserver.instances.at(-1)?.options?.rootMargin).toBe('-64px 0px -10% 0px');
}

function usesZeroRootMarginWithoutScrollPadding(): void {
  openTooltip(createFixture());

  expect(TestIntersectionObserver.instances.at(-1)?.options?.rootMargin).toBe('0px 0px 0px 0px');
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
    'restores focus to the hidden host without scrolling when focus was inside tooltip',
    restoresFocusToHiddenHostWithoutScrollingFromPane,
  );
  it(
    'does not restore focus to the hidden host when restoration is disabled',
    doesNotRestoreFocusToHiddenHostWhenDisabled,
  );
  it('emits closed when host leaves the viewport', emitsClosedWhenHostLeavesViewport);
  it('stays open when origin is out of view on open', staysOpenWhenOriginIsOutOfViewOnOpen);
  it('closes after origin is seen and leaves', closesAfterOriginIsSeenAndLeaves);
  it('resets seen state after origin changes', resetsSeenStateAfterOriginChanges);
  it('closes when origin enters and leaves in one batch', closesWhenOriginEntersAndLeavesInOneBatch);
  it('observes trigger host for point origin', observesTriggerHostForPointOrigin);
  it('observes trigger host for point origin on open', observesTriggerHostForPointOriginOnOpen);
  it('observes the same host after close and reopen', observesSameHostAfterCloseAndReopen);
  it('keeps seen state when point origin changes', keepsSeenStateWhenPointOriginChanges);
  it('does not churn host observation between point origins', doesNotChurnHostObservationBetweenPointOrigins);
  it(
    'observes trigger host after switching from element origin to point origin',
    observesTriggerHostAfterSwitchingFromElementToPoint,
  );
  it('reads root scroller scroll-padding for observer rootMargin', readsScrollPaddingFromRootScrollerForRootMargin);
  it('uses zero rootMargin without scroll-padding', usesZeroRootMarginWithoutScrollPadding);
});

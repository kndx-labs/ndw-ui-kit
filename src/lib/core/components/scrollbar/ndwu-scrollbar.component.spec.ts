/* eslint id-denylist: 0 */
import {provideZonelessChangeDetection} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NdwuScrollbarComponent} from './ndwu-scrollbar.component';

interface PointerInit {
  pointerId?: number;
  pointerType?: string;
  isPrimary?: boolean;
  button?: number;
  clientX?: number;
  clientY?: number;
}

interface WheelInit {
  deltaX?: number;
  deltaY?: number;
  deltaMode?: number;
  ctrlKey?: boolean;
  shiftKey?: boolean;
}

interface ScrollbarHarness {
  fixture: ComponentFixture<NdwuScrollbarComponent>;
  host: HTMLElement;
  content: HTMLElement;
  thumbY: HTMLElement;
  thumbX: HTMLElement;
  trackY: HTMLElement;
  trackX: HTMLElement;
  captureY: ReturnType<typeof vi.fn>;
  captureX: ReturnType<typeof vi.fn>;
  scrollTop: () => number;
  scrollLeft: () => number;
  setScrollTop: (value: number) => void;
  setAutoHide: (value: boolean | string) => void;
  setHideDelay: (value: number) => void;
  setTouchTargetSize: (value: string | undefined) => void;
  setDisabled: (value: boolean) => void;
  setTrackInsets: (y: number, x: number) => void;
  triggerHostResize: () => void;
  press: (pointerType: string) => void;
  scroll: () => void;
  hasClass: (modifier: string) => boolean;
}

interface CreateScrollbarOptions {
  axis?: 'x' | 'y' | 'both';
  autoHide?: boolean | string;
  disabled?: boolean;
  overflow?: boolean;
  coarsePointer?: boolean;
  tabindex?: string;
}

const fixtures: ComponentFixture<NdwuScrollbarComponent>[] = [];
const animationFrames = new Map<number, FrameRequestCallback>();
const resizeObservers: TestResizeObserver[] = [];
let nextFrameId = 1;

class TestResizeObserver implements ResizeObserver {
  private readonly observed = new Set<Element>();

  constructor(private readonly callback: ResizeObserverCallback) {
    resizeObservers.push(this);
  }

  public observe(target: Element): void {
    this.observed.add(target);
  }

  public unobserve(target: Element): void {
    this.observed.delete(target);
  }

  public trigger(target: Element): void {
    const entry: ResizeObserverEntry = {
      target,
      contentRect: new DOMRect(),
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    };

    this.callback([entry], this);
  }

  public observes(target: Element): boolean {
    return this.observed.has(target);
  }

  public disconnect(): void {
    this.observed.clear();
  }
}

const rect = (top: number, left: number, width: number, height: number): DOMRect => {
  return {top, left, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({})};
};

const pointerEvent = (type: string, init: PointerInit = {}): PointerEvent => {
  const event = new Event(type, {bubbles: true, cancelable: true});
  const values = {
    pointerId: init.pointerId ?? 1,
    pointerType: init.pointerType ?? 'mouse',
    isPrimary: init.isPrimary ?? true,
    button: init.button ?? 0,
    clientX: init.clientX ?? 10,
    clientY: init.clientY ?? 10,
  };

  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(event, key, {value});
  }

  return event as PointerEvent;
};

const wheel = (target: HTMLElement, init: WheelInit = {}): WheelEvent => {
  const event = new WheelEvent('wheel', {bubbles: true, cancelable: true, ...init});

  target.dispatchEvent(event);

  return event;
};

const flushAnimationFrames = (): void => {
  while (animationFrames.size > 0) {
    const callbacks = [...animationFrames.values()];

    animationFrames.clear();

    for (const callback of callbacks) {
      callback(0);
    }
  }
};

// jsdom has no matchMedia; the component reads `(pointer: coarse)` when it is created.
const stubCoarsePointer = (matches: boolean): void => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => {
      return {matches: query === '(pointer: coarse)' && matches} as MediaQueryList;
    },
  });
};

// Only timeouts: faking requestAnimationFrame too would replace the frame stub above.
const useFakeTimeouts = (): void => {
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
};

const createScrollbar = async (options: CreateScrollbarOptions = {}): Promise<ScrollbarHarness> => {
  if (options.coarsePointer !== undefined) {
    stubCoarsePointer(options.coarsePointer);
  }

  const fixture = TestBed.createComponent(NdwuScrollbarComponent);

  fixtures.push(fixture);

  const {componentRef} = fixture;

  if (options.tabindex !== undefined) {
    (fixture.nativeElement as HTMLElement).setAttribute('tabindex', options.tabindex);
  }

  componentRef.setInput('ndwuScrollbarAxis', options.axis ?? 'y');

  if (options.disabled) {
    componentRef.setInput('ndwuScrollbarDisabled', true);
  }

  if (options.autoHide !== undefined) {
    componentRef.setInput('ndwuScrollbarAutoHide', options.autoHide);
  }

  let usedInsetY = 4;
  let usedInsetX = 4;

  fixture.detectChanges();
  await fixture.whenStable();

  const host = fixture.nativeElement as HTMLElement;
  const queryRequired = (element: Element, selector: string): HTMLElement => {
    const match = element.querySelector<HTMLElement>(selector);

    if (match === null) {
      throw new Error(`Missing scrollbar test element: ${selector}`);
    }

    return match;
  };
  const content = queryRequired(host, '.ndwu-scrollbar__content');
  const trackY = queryRequired(host, '.ndwu-scrollbar__track--vertical');
  const trackX = queryRequired(host, '.ndwu-scrollbar__track--horizontal');
  const thumbY = queryRequired(trackY, '.ndwu-scrollbar__thumb');
  const thumbX = queryRequired(trackX, '.ndwu-scrollbar__thumb');
  let currentScrollTop = 0;
  let currentScrollLeft = 0;

  Object.defineProperties(content, {
    scrollHeight: {configurable: true, value: options.overflow === false ? 200 : 600},
    clientHeight: {configurable: true, value: 200},
    scrollWidth: {configurable: true, value: options.overflow === false ? 200 : 500},
    clientWidth: {configurable: true, value: 200},
    scrollTop: {
      configurable: true,
      get: () => currentScrollTop,
      set: (value: number) => {
        currentScrollTop = value;
      },
    },
    scrollLeft: {
      configurable: true,
      get: () => currentScrollLeft,
      set: (value: number) => {
        currentScrollLeft = value;
      },
    },
  });

  host.getBoundingClientRect = () => rect(0, 0, 200, 200);
  trackY.getBoundingClientRect = () => rect(0, 190, 6, 200);
  trackX.getBoundingClientRect = () => rect(190, 0, 200, 6);
  thumbY.getBoundingClientRect = () => rect(0, 190, 6, 66.6666666667);
  thumbX.getBoundingClientRect = () => rect(190, 0, 80, 6);

  const captureY = vi.fn();
  const captureX = vi.fn();

  thumbY.setPointerCapture = captureY;
  thumbY.releasePointerCapture = vi.fn();
  thumbX.setPointerCapture = captureX;
  thumbX.releasePointerCapture = vi.fn();

  const nativeGetComputedStyle = window.getComputedStyle.bind(window);

  vi.stubGlobal('getComputedStyle', (element: Element): CSSStyleDeclaration => {
    if (element === host) {
      return {
        width: '200px',
        height: '200px',
        boxSizing: 'content-box',
        paddingTop: '0px',
        paddingRight: '0px',
        paddingBottom: '0px',
        paddingLeft: '0px',
        borderTopWidth: '0px',
        borderRightWidth: '0px',
        borderBottomWidth: '0px',
        borderLeftWidth: '0px',
        getPropertyValue: (property: string) => property === '--ndwu-scrollbar-min-thumb-size' ? '24px' : '',
      } as CSSStyleDeclaration;
    }

    if (element === trackY) {
      return {height: '200px', width: '6px', right: `${usedInsetY}px`, bottom: '4px'} as CSSStyleDeclaration;
    }

    if (element === trackX) {
      return {height: '6px', width: '200px', right: '4px', bottom: `${usedInsetX}px`} as CSSStyleDeclaration;
    }

    return nativeGetComputedStyle(element);
  });

  if (options.overflow === false) {
    Object.defineProperties(content, {
      scrollHeight: {configurable: true, value: 200},
      scrollWidth: {configurable: true, value: 200},
    });
  }

  componentRef.instance.refresh();
  flushAnimationFrames();
  fixture.detectChanges();

  return {
    fixture,
    host,
    content,
    thumbY,
    thumbX,
    trackY,
    trackX,
    captureY,
    captureX,
    scrollTop: () => currentScrollTop,
    scrollLeft: () => currentScrollLeft,
    setScrollTop: (value) => {
      currentScrollTop = value;
    },
    setAutoHide: (value) => componentRef.setInput('ndwuScrollbarAutoHide', value),
    setHideDelay: (value) => componentRef.setInput('ndwuScrollbarHideDelay', value),
    setTouchTargetSize: (value) => componentRef.setInput('ndwuScrollbarTouchTargetSize', value),
    setDisabled: (value) => componentRef.setInput('ndwuScrollbarDisabled', value),
    setTrackInsets: (y, x) => {
      usedInsetY = y;
      usedInsetX = x;
    },
    triggerHostResize: () => {
      resizeObservers.find(observer => observer.observes(host))?.trigger(host);
    },
    // A press on the content, as at the start of a swipe; the host sees it in the capture phase.
    press: (pointerType) => {
      content.dispatchEvent(pointerEvent('pointerdown', {pointerType}));
      fixture.detectChanges();
    },
    scroll: () => {
      content.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
    },
    hasClass: (modifier) => {
      return host.classList.contains(`ndwu-scrollbar--${modifier}`);
    },
  };
};

beforeEach(() => {
  TestBed.configureTestingModule({providers: [provideZonelessChangeDetection()]});
  vi.stubGlobal('ResizeObserver', TestResizeObserver);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = nextFrameId++;

    animationFrames.set(id, callback);

    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => animationFrames.delete(id));
});

afterEach(() => {
  for (const fixture of fixtures.splice(0)) {
    fixture.destroy();
  }

  animationFrames.clear();
  resizeObservers.length = 0;
  nextFrameId = 1;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('NdwuScrollbarComponent: pointer admission', () => {
  it.each(['mouse', 'touch', 'pen'])('starts thumb drag for %s', async (pointerType) => {
    const harness = await createScrollbar();
    const event = pointerEvent('pointerdown', {pointerType, pointerId: 7});

    harness.setScrollTop(80);
    harness.thumbY.dispatchEvent(event);
    harness.fixture.detectChanges();

    expect(harness.captureY).toHaveBeenCalledWith(7);
    expect(harness.host.classList.contains('ndwu-scrollbar--dragging')).toBe(true);
    expect(harness.host.classList.contains('ndwu-scrollbar--dragging-y')).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(harness.scrollTop()).toBe(80);
  });

  it.each([
    ['secondary pointer', {isPrimary: false}],
    ['unknown pointer type', {pointerType: 'unknown'}],
    ['right button', {button: 2}],
  ])('rejects %s', async (_name, init) => {
    const harness = await createScrollbar();
    const event = pointerEvent('pointerdown', init);

    harness.thumbY.dispatchEvent(event);
    harness.fixture.detectChanges();

    expect(harness.captureY).not.toHaveBeenCalled();
    expect(harness.host.classList.contains('ndwu-scrollbar--dragging')).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it('rejects disabled and non-overflowing presses', async () => {
    const disabled = await createScrollbar();
    const disabledEvent = pointerEvent('pointerdown', {pointerType: 'mouse'});

    // No change detection yet: the disabled effect has not reset the overflow state, so only
    // the disabled check can reject the press.
    disabled.setDisabled(true);
    disabled.thumbY.dispatchEvent(disabledEvent);

    const noOverflow = await createScrollbar({overflow: false});
    const noOverflowEvent = pointerEvent('pointerdown', {pointerType: 'mouse'});

    noOverflow.thumbY.dispatchEvent(noOverflowEvent);

    expect(disabled.captureY).not.toHaveBeenCalled();
    expect(disabledEvent.defaultPrevented).toBe(false);
    expect(noOverflow.captureY).not.toHaveBeenCalled();
    expect(noOverflowEvent.defaultPrevented).toBe(false);
  });

  it('keeps original drag when another primary pointer presses', async () => {
    const harness = await createScrollbar({axis: 'both'});
    const first = pointerEvent('pointerdown', {pointerType: 'touch', pointerId: 1, clientY: 10});
    const second = pointerEvent('pointerdown', {pointerType: 'pen', pointerId: 2, clientY: 10});

    harness.thumbY.dispatchEvent(first);
    harness.thumbY.dispatchEvent(second);
    harness.fixture.detectChanges();
    harness.host.ownerDocument.dispatchEvent(
      pointerEvent('pointermove', {pointerType: 'touch', pointerId: 1, clientY: 110}),
    );

    const offsetAfterFirstMove = harness.scrollTop();

    harness.host.ownerDocument.dispatchEvent(
      pointerEvent('pointerup', {pointerType: 'pen', pointerId: 2}),
    );
    harness.fixture.detectChanges();

    expect(harness.captureY).toHaveBeenCalledTimes(1);
    expect(harness.captureY).toHaveBeenCalledWith(1);
    expect(second.defaultPrevented).toBe(false);
    expect(offsetAfterFirstMove).toBeGreaterThan(0);
    expect(harness.host.classList.contains('ndwu-scrollbar--dragging')).toBe(true);
  });

  it('centers track only for primary main-button mouse', async () => {
    const harness = await createScrollbar();
    const mouse = pointerEvent('pointerdown', {pointerType: 'mouse', clientY: 150});

    harness.trackY.dispatchEvent(mouse);
    expect(harness.scrollTop()).toBeCloseTo(349.25, 2);
    expect(mouse.defaultPrevented).toBe(true);

    for (
      const init of [
        {pointerType: 'touch'},
        {pointerType: 'pen'},
        {pointerType: 'mouse', button: 2},
        {pointerType: 'mouse', isPrimary: false},
      ]
    ) {
      harness.setScrollTop(40);

      const event = pointerEvent('pointerdown', {...init, clientY: 150});

      harness.trackY.dispatchEvent(event);
      expect(harness.scrollTop()).toBe(40);
      expect(event.defaultPrevented).toBe(false);
    }

    harness.thumbY.dispatchEvent(pointerEvent('pointerdown', {pointerType: 'mouse', pointerId: 4}));
    harness.setScrollTop(40);

    const duringDrag = pointerEvent('pointerdown', {pointerType: 'mouse', clientY: 150});

    harness.trackY.dispatchEvent(duringDrag);
    expect(harness.scrollTop()).toBe(40);
    expect(duringDrag.defaultPrevented).toBe(false);
  });

  it.each(['pointerup', 'pointercancel'])('ends drag on %s and ignores later moves', async (endType) => {
    const harness = await createScrollbar();

    harness.thumbY.dispatchEvent(pointerEvent('pointerdown', {pointerId: 1, clientY: 10}));
    harness.host.ownerDocument.dispatchEvent(pointerEvent(endType, {pointerId: 1}));
    harness.fixture.detectChanges();

    const releasedOffset = harness.scrollTop();

    harness.host.ownerDocument.dispatchEvent(pointerEvent('pointermove', {pointerId: 1, clientY: 150}));

    expect(harness.host.classList.contains('ndwu-scrollbar--dragging')).toBe(false);
    expect(harness.host.classList.contains('ndwu-scrollbar--dragging-y')).toBe(false);
    expect(harness.scrollTop()).toBe(releasedOffset);
  });

  it.each(['pointerup', 'pointercancel'])('resyncs thumb after %s without a later scroll', async (endType) => {
    const harness = await createScrollbar();

    flushAnimationFrames();

    const thumbBefore = harness.thumbY.style.transform;

    expect(animationFrames.size).toBe(0);
    harness.thumbY.dispatchEvent(pointerEvent('pointerdown', {pointerId: 1, clientY: 10}));
    harness.fixture.detectChanges();
    expect(harness.captureY).toHaveBeenCalledWith(1);
    expect(harness.host.classList.contains('ndwu-scrollbar--dragging')).toBe(true);
    harness.setScrollTop(100);
    harness.content.dispatchEvent(new Event('scroll'));
    expect(harness.thumbY.style.transform).toBe(thumbBefore);
    expect(animationFrames.size).toBe(0);
    flushAnimationFrames();
    expect(harness.thumbY.style.transform).toBe(thumbBefore);

    harness.host.ownerDocument.dispatchEvent(pointerEvent(endType, {pointerId: 1}));
    flushAnimationFrames();

    expect(harness.thumbY.style.transform).not.toBe(thumbBefore);
    expect(harness.thumbY.style.transform).toBe('translate3d(0, 33px, 0)');
  });
});

describe('NdwuScrollbarComponent: activity', () => {
  it.each([
    ['omitted', undefined, false],
    ['empty attribute string', '', true],
  ])('coerces auto-hide input when %s', async (_label, autoHide, expected) => {
    const harness = await createScrollbar(autoHide === undefined ? {} : {autoHide});

    expect(harness.hasClass('auto-hide')).toBe(expected);
    expect(harness.hasClass('active')).toBe(false);
  });

  it('stays inactive for a mouse on a fine-pointer device', async () => {
    const harness = await createScrollbar({coarsePointer: false});

    flushAnimationFrames();
    useFakeTimeouts();
    harness.press('mouse');
    harness.scroll();

    expect(harness.hasClass('touch')).toBe(false);
    expect(harness.hasClass('active')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('marks scroll activity for a mouse on a coarse-pointer device without the touch target', async () => {
    const harness = await createScrollbar({coarsePointer: true});

    expect(harness.hasClass('touch')).toBe(true);

    flushAnimationFrames();
    useFakeTimeouts();
    harness.press('mouse');
    harness.scroll();

    expect(harness.hasClass('touch')).toBe(false);
    expect(harness.hasClass('active')).toBe(true);
  });

  it.each([false, true])('keeps a touch scroll active for one second with auto-hide=%s', async (autoHide) => {
    const harness = await createScrollbar({autoHide});

    flushAnimationFrames();
    useFakeTimeouts();
    harness.press('touch');
    harness.scroll();
    expect(harness.hasClass('touch')).toBe(true);
    expect(harness.hasClass('active')).toBe(true);

    vi.advanceTimersByTime(999);
    harness.fixture.detectChanges();
    expect(harness.hasClass('active')).toBe(true);

    vi.advanceTimersByTime(1);
    harness.fixture.detectChanges();
    expect(harness.hasClass('active')).toBe(false);
  });

  it('uses the configured hide delay after touch scroll', async () => {
    const harness = await createScrollbar();

    harness.setHideDelay(300);
    harness.fixture.detectChanges();
    useFakeTimeouts();
    harness.press('touch');
    harness.scroll();
    vi.advanceTimersByTime(299);
    harness.fixture.detectChanges();
    expect(harness.hasClass('active')).toBe(true);
    vi.advanceTimersByTime(1);
    harness.fixture.detectChanges();
    expect(harness.hasClass('active')).toBe(false);
  });

  it('sets and removes the inline touch target size', async () => {
    const harness = await createScrollbar();
    const property = '--ndwu-scrollbar-touch-target-size';

    harness.setTouchTargetSize('48px');
    harness.fixture.detectChanges();
    expect(harness.host.style.getPropertyValue(property)).toBe('48px');
    harness.setTouchTargetSize(undefined);
    harness.fixture.detectChanges();
    expect(harness.host.style.getPropertyValue(property)).toBe('');
  });

  it('keeps activity through a stationary drag and starts expiry after release', async () => {
    const harness = await createScrollbar({autoHide: true});

    flushAnimationFrames();
    useFakeTimeouts();
    harness.thumbY.dispatchEvent(pointerEvent('pointerdown', {pointerType: 'touch', pointerId: 1}));
    harness.fixture.detectChanges();
    expect(harness.hasClass('active')).toBe(true);

    vi.advanceTimersByTime(2000);
    harness.scroll();
    expect(harness.hasClass('active')).toBe(true);

    harness.host.ownerDocument.dispatchEvent(pointerEvent('pointerup', {pointerType: 'touch', pointerId: 1}));
    harness.fixture.detectChanges();
    vi.advanceTimersByTime(999);
    harness.fixture.detectChanges();
    expect(harness.hasClass('active')).toBe(true);

    vi.advanceTimersByTime(1);
    harness.fixture.detectChanges();
    expect(harness.hasClass('active')).toBe(false);
  });

  it('drops activity when a mouse takes over during a touch drag', async () => {
    const harness = await createScrollbar();

    flushAnimationFrames();
    useFakeTimeouts();
    harness.thumbY.dispatchEvent(pointerEvent('pointerdown', {pointerType: 'touch', pointerId: 1}));
    harness.fixture.detectChanges();
    expect(harness.hasClass('active')).toBe(true);

    harness.press('mouse');
    harness.scroll();

    expect(harness.hasClass('dragging')).toBe(true);
    expect(harness.hasClass('active')).toBe(false);
  });

  it('ends drag and clears activity when disabled', async () => {
    const harness = await createScrollbar({autoHide: true});

    flushAnimationFrames();
    useFakeTimeouts();
    harness.thumbY.dispatchEvent(pointerEvent('pointerdown', {pointerType: 'touch', pointerId: 1}));
    harness.fixture.detectChanges();
    expect(harness.hasClass('dragging')).toBe(true);
    expect(harness.hasClass('active')).toBe(true);

    harness.setDisabled(true);
    harness.fixture.detectChanges();
    expect(harness.hasClass('dragging')).toBe(false);
    expect(harness.hasClass('active')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);

    harness.scroll();
    expect(harness.hasClass('active')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves no pending timer after destroy, even mid-drag', async () => {
    const harness = await createScrollbar();

    flushAnimationFrames();
    useFakeTimeouts();
    harness.press('touch');
    harness.scroll();
    harness.thumbY.dispatchEvent(pointerEvent('pointerdown', {pointerType: 'touch', pointerId: 1}));
    expect(harness.hasClass('active')).toBe(true);

    harness.fixture.destroy();
    // Ending the drag writes signals, and the zoneless scheduler queues a zero-delay timeout.
    vi.advanceTimersByTime(0);

    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('NdwuScrollbarComponent: touch target insets', () => {
  it('stores used track insets in px, zero without overflow, and rewrites only changes', async () => {
    const harness = await createScrollbar({axis: 'y'});
    const insetY = (): string => {
      return harness.host.style.getPropertyValue('--ndwu-scrollbar-hit-inset-y');
    };
    const insetX = (): string => {
      return harness.host.style.getPropertyValue('--ndwu-scrollbar-hit-inset-x');
    };

    harness.setTrackInsets(40, 12);
    harness.triggerHostResize();
    flushAnimationFrames();

    expect(insetY()).toBe('40px');
    expect(insetX()).toBe('0px');

    const setProperty = vi.spyOn(harness.host.style, 'setProperty');

    harness.fixture.componentRef.instance.refresh();
    flushAnimationFrames();
    expect(setProperty).not.toHaveBeenCalled();

    harness.fixture.componentRef.setInput('ndwuScrollbarAxis', 'both');
    harness.setTrackInsets(52, 20);
    harness.fixture.detectChanges();
    flushAnimationFrames();

    expect(insetY()).toBe('52px');
    expect(insetX()).toBe('20px');
  });
});

describe('NdwuScrollbarComponent: focus and wheel', () => {
  it('marks both decorative tracks as hidden from assistive technology', async () => {
    const harness = await createScrollbar();

    expect(harness.trackY.getAttribute('aria-hidden')).toBe('true');
    expect(harness.trackX.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps only content in the tab order when host has a tabindex', async () => {
    const harness = await createScrollbar({tabindex: '0'});

    expect(harness.content.getAttribute('tabindex')).toBe('0');
    expect(harness.host.getAttribute('tabindex')).toBe('-1');

    harness.host.focus();

    expect(harness.host.ownerDocument.activeElement).toBe(harness.content);
  });

  it.each(['trackY', 'thumbY'] as const)('scrolls vertically for a wheel over %s', async (targetName) => {
    const harness = await createScrollbar();
    const event = wheel(harness[targetName], {deltaY: 40});

    expect(harness.scrollTop()).toBe(40);
    expect(event.defaultPrevented).toBe(true);
  });

  it('chains a forward wheel at the vertical end', async () => {
    const harness = await createScrollbar();

    harness.setScrollTop(400);

    const event = wheel(harness.trackY, {deltaY: 40});

    expect(harness.scrollTop()).toBe(400);
    expect(event.defaultPrevented).toBe(false);
  });

  it('chains a backward wheel at the vertical start', async () => {
    const harness = await createScrollbar();
    const event = wheel(harness.trackY, {deltaY: -40});

    expect(harness.scrollTop()).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it('leaves ctrl-wheel untouched', async () => {
    const harness = await createScrollbar();
    const event = wheel(harness.trackY, {deltaY: 40, ctrlKey: true});

    expect(harness.scrollTop()).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it('does not consume wheel input on an unconfigured axis', async () => {
    const harness = await createScrollbar({axis: 'x'});
    const event = wheel(harness.trackY, {deltaY: 40});

    expect(harness.scrollTop()).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it('maps shift-wheel on the horizontal track to horizontal scrolling', async () => {
    const harness = await createScrollbar({axis: 'both'});
    const event = wheel(harness.trackX, {deltaY: 40, shiftKey: true});

    expect(harness.scrollLeft()).toBe(40);
    expect(harness.scrollTop()).toBe(0);
    expect(event.defaultPrevented).toBe(true);
  });
});

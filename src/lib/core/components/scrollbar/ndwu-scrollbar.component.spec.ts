import 'zone.js';
/* eslint id-denylist: 0 */
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NdwuScrollbarComponent} from './ndwu-scrollbar.component';
import type {NdwuScrollbarPadding} from './ndwu-scrollbar.types';

interface PointerInit {
  pointerId?: number;
  pointerType?: string;
  isPrimary?: boolean;
  button?: number;
  clientX?: number;
  clientY?: number;
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
  setScrollTop: (value: number) => void;
  setAutoHide: (value: boolean | string) => void;
  setDisabled: (value: boolean) => void;
  setPadding: (value: NdwuScrollbarPadding) => void;
  setTrackInsets: (y: number, x: number) => void;
  triggerHostResize: () => void;
}

interface CreateScrollbarOptions {
  axis?: 'x' | 'y' | 'both';
  autoHide?: boolean | string;
  disabled?: boolean;
  overflow?: boolean;
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

const flushAnimationFrames = (): void => {
  while (animationFrames.size > 0) {
    const callbacks = [...animationFrames.values()];

    animationFrames.clear();

    for (const callback of callbacks) {
      callback(0);
    }
  }
};

const createScrollbar = async (options: CreateScrollbarOptions = {}): Promise<ScrollbarHarness> => {
  const fixture = TestBed.createComponent(NdwuScrollbarComponent);

  fixtures.push(fixture);

  const {componentRef} = fixture;

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
    setScrollTop: (value) => {
      currentScrollTop = value;
    },
    setAutoHide: (value) => componentRef.setInput('ndwuScrollbarAutoHide', value),
    setDisabled: (value) => componentRef.setInput('ndwuScrollbarDisabled', value),
    setPadding: (value) => componentRef.setInput('ndwuScrollbarPadding', value),
    setTrackInsets: (y, x) => {
      usedInsetY = y;
      usedInsetX = x;
    },
    triggerHostResize: () => {
      resizeObservers.find(observer => observer.observes(host))?.trigger(host);
    },
  };
};

beforeEach(() => {
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
});

describe('NdwuScrollbarComponent pointer admission', () => {
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
    const disabled = await createScrollbar({disabled: true});
    const disabledEvent = pointerEvent('pointerdown', {pointerType: 'mouse'});

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

describe('NdwuScrollbarComponent activity wiring', () => {
  it.each([
    ['omitted', undefined, false],
    ['false', false, false],
    ['false attribute string', 'false', false],
    ['true', true, true],
    ['empty attribute string', '', true],
  ])('applies auto-hide input coercion for %s', async (_label, autoHide, expected) => {
    const harness = await createScrollbar(autoHide === undefined ? {} : {autoHide});

    expect(harness.host.classList.contains('ndwu-scrollbar--auto-hide')).toBe(expected);
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(false);
  });

  it.each([false, true])('tracks scroll activity with auto-hide=%s', async (autoHide) => {
    const harness = await createScrollbar({autoHide});

    flushAnimationFrames();
    vi.useFakeTimers();

    harness.content.dispatchEvent(new Event('scroll'));
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(true);

    vi.advanceTimersByTime(999);
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(true);
    vi.advanceTimersByTime(1);
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(false);
  });

  it('keeps activity through a stationary drag and starts expiry after release', async () => {
    const harness = await createScrollbar({autoHide: true});

    flushAnimationFrames();
    vi.useFakeTimers();

    harness.thumbY.dispatchEvent(pointerEvent('pointerdown', {pointerId: 1}));
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(true);
    vi.advanceTimersByTime(2000);
    harness.content.dispatchEvent(new Event('scroll'));
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(true);

    harness.host.ownerDocument.dispatchEvent(pointerEvent('pointerup', {pointerId: 1}));
    harness.fixture.detectChanges();
    vi.advanceTimersByTime(999);
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(true);
    vi.advanceTimersByTime(1);
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(false);
  });

  it('preserves activity and drag state when auto-hide input changes', async () => {
    const harness = await createScrollbar();

    flushAnimationFrames();
    vi.useFakeTimers();

    harness.content.dispatchEvent(new Event('scroll'));
    harness.fixture.detectChanges();
    harness.setAutoHide(true);
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(true);
    expect(harness.host.classList.contains('ndwu-scrollbar--auto-hide')).toBe(true);

    harness.setScrollTop(60);
    harness.thumbY.dispatchEvent(pointerEvent('pointerdown', {pointerId: 1}));
    harness.fixture.detectChanges();
    harness.setAutoHide(false);
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(true);
    expect(harness.host.classList.contains('ndwu-scrollbar--dragging')).toBe(true);
    expect(harness.host.classList.contains('ndwu-scrollbar--auto-hide')).toBe(false);
    expect(harness.scrollTop()).toBe(60);
  });

  it('disabled state ends drag, clears activity and does not leave a stale timeout', async () => {
    const harness = await createScrollbar({autoHide: true});

    flushAnimationFrames();
    vi.useFakeTimers();

    harness.thumbY.dispatchEvent(pointerEvent('pointerdown', {pointerId: 1}));
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--dragging')).toBe(true);
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(true);
    harness.setDisabled(true);
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--dragging')).toBe(false);
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(false);

    harness.content.dispatchEvent(new Event('scroll'));
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(false);

    vi.advanceTimersByTime(2000);
    harness.setDisabled(false);
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(false);
  });

  it('disposes pending activity when the fixture is destroyed', async () => {
    const harness = await createScrollbar({autoHide: true});

    flushAnimationFrames();
    vi.useFakeTimers();

    harness.content.dispatchEvent(new Event('scroll'));
    harness.fixture.detectChanges();
    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(true);
    harness.fixture.destroy();
    expect(() => vi.advanceTimersByTime(2000)).not.toThrow();

    expect(harness.host.classList.contains('ndwu-scrollbar--active')).toBe(true);
  });

  it('keeps activity state isolated between component instances', async () => {
    const first = await createScrollbar({autoHide: true});
    const second = await createScrollbar({autoHide: true});

    flushAnimationFrames();

    first.content.dispatchEvent(new Event('scroll'));
    first.fixture.detectChanges();
    second.fixture.detectChanges();

    expect(first.host.classList.contains('ndwu-scrollbar--active')).toBe(true);
    expect(second.host.classList.contains('ndwu-scrollbar--active')).toBe(false);
  });
});

describe('NdwuScrollbarComponent coarse hit insets', () => {
  it('exposes used vertical and horizontal track insets in pixels', async () => {
    const harness = await createScrollbar({axis: 'both'});

    harness.setTrackInsets(40, 12);
    harness.setPadding({right: '10%', bottom: 'calc(8px + 5%)'});
    harness.fixture.componentRef.instance.refresh();
    flushAnimationFrames();

    expect(harness.host.style.getPropertyValue('--ndwu-scrollbar-hit-inset-y')).toBe('40px');
    expect(harness.host.style.getPropertyValue('--ndwu-scrollbar-hit-inset-x')).toBe('12px');
  });

  it('sets zero inset for an axis without overflow', async () => {
    const harness = await createScrollbar({axis: 'y'});

    harness.setTrackInsets(40, 12);
    harness.fixture.componentRef.instance.refresh();
    flushAnimationFrames();

    expect(harness.host.style.getPropertyValue('--ndwu-scrollbar-hit-inset-y')).toBe('40px');
    expect(harness.host.style.getPropertyValue('--ndwu-scrollbar-hit-inset-x')).toBe('0px');
  });

  it('updates measured insets after padding input changes and host resize', async () => {
    const harness = await createScrollbar({axis: 'both'});

    harness.setTrackInsets(48, 16);
    harness.setPadding({right: 'calc(8px + 5%)', bottom: '10%'});
    harness.fixture.detectChanges();
    flushAnimationFrames();

    expect(harness.host.style.getPropertyValue('--ndwu-scrollbar-hit-inset-y')).toBe('48px');
    expect(harness.host.style.getPropertyValue('--ndwu-scrollbar-hit-inset-x')).toBe('16px');

    harness.setTrackInsets(52, 20);
    harness.triggerHostResize();
    flushAnimationFrames();

    expect(harness.host.style.getPropertyValue('--ndwu-scrollbar-hit-inset-y')).toBe('52px');
    expect(harness.host.style.getPropertyValue('--ndwu-scrollbar-hit-inset-x')).toBe('20px');
  });
});

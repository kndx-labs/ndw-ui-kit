import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  MUTATION_SETTLE_DELAY,
  type NdwuMutationRecalc,
  NdwuScrollbarContentObserver,
  resolveMutationRecalc,
} from './ndwu-scrollbar.content-observer';

class FakeResizeObserver {
  public readonly observed = new Set<Element>();
  public readonly log: string[] = [];
  public isDisconnected = false;
  private callback: ResizeObserverCallback = () => undefined;

  public connect(callback: ResizeObserverCallback): this {
    this.callback = callback;

    return this;
  }

  public observe(target: Element): void {
    this.observed.add(target);
    this.log.push(`observe:${target.id}`);
  }

  public unobserve(target: Element): void {
    this.observed.delete(target);
    this.log.push(`unobserve:${target.id}`);
  }

  public disconnect(): void {
    this.observed.clear();
    this.isDisconnected = true;
  }

  public trigger(...targets: Element[]): void {
    const entries = targets.map(target => ({target}) as ResizeObserverEntry);

    this.callback(entries, this);
  }
}

// MutationObserver callbacks run as microtasks
const flushMutations = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

const element = (id: string, className = ''): HTMLElement => {
  const el = document.createElement('div');

  el.id = id;
  el.className = className;

  return el;
};

const setup = () => {
  const style = document.createElement('style');
  const host = element('host');
  const content = element('content');
  const first = element('first');
  const wrapper = element('wrapper', 'contents');
  const nested = element('nested');

  style.textContent = '.contents { display: contents; }';
  wrapper.append(nested);
  content.append(first, wrapper);
  host.append(content);
  document.head.append(style);
  document.body.append(host);

  const resizeObserver = new FakeResizeObserver();
  const events: Array<'hostResize' | NdwuMutationRecalc> = [];
  const observer = new NdwuScrollbarContentObserver(
    host,
    content,
    {
      hostResize: () => events.push('hostResize'),
      contentChange: (recalc) => events.push(recalc),
    },
    (callback) => {
      return resizeObserver.connect(callback);
    },
  );
  const teardown = (): void => {
    observer.disconnect();
    host.remove();
    style.remove();
  };

  return {host, content, first, wrapper, nested, events, observer, resizeObserver, teardown};
};

const observedIds = (resizeObserver: FakeResizeObserver): string[] => {
  return Array.from(resizeObserver.observed, target => target.id).sort();
};

describe('resolveMutationRecalc', () => {
  const records = (...types: MutationRecordType[]): Array<{type: MutationRecordType}> => {
    return types.map(type => ({type}));
  };

  it('requires a full recalculation when a batch mixes node changes with other changes', () => {
    expect(resolveMutationRecalc(records('characterData', 'attributes', 'childList'))).toBe('full');
  });
});

describe('NdwuScrollbarContentObserver: resize', () => {
  it('observes the host, the content and the content children, looking through display: contents', () => {
    const {resizeObserver, teardown} = setup();

    expect(observedIds(resizeObserver)).toEqual(['content', 'first', 'host', 'nested']);

    teardown();
  });

  it('reports a host resize before the content change', () => {
    const {host, events, resizeObserver, teardown} = setup();

    resizeObserver.trigger(host);

    expect(events).toEqual(['hostResize', 'full']);

    teardown();
  });

  it('reports a child resize as a content change only', () => {
    const {first, events, resizeObserver, teardown} = setup();

    resizeObserver.trigger(first);

    expect(events).toEqual(['full']);

    teardown();
  });

  it('observes the host again on request', () => {
    const {observer, resizeObserver, teardown} = setup();

    resizeObserver.log.length = 0;
    observer.reobserveHost();

    expect(resizeObserver.log).toEqual(['unobserve:host', 'observe:host']);

    teardown();
  });
});

describe('NdwuScrollbarContentObserver: node changes', () => {
  it('reports added nodes and starts observing them', async () => {
    const {content, events, resizeObserver, teardown} = setup();

    content.append(element('added'));
    await flushMutations();

    expect(events).toEqual(['full']);
    expect(observedIds(resizeObserver)).toContain('added');

    teardown();
  });

  it('reports removed nodes and stops observing them', async () => {
    const {first, events, resizeObserver, teardown} = setup();

    first.remove();
    await flushMutations();

    expect(events).toEqual(['full']);
    expect(observedIds(resizeObserver)).not.toContain('first');

    teardown();
  });
});

describe('NdwuScrollbarContentObserver: text and attribute changes', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('asks for a size check on a text change and for a full recalculation once changes settle', async () => {
    const {nested, events, teardown} = setup();

    const text = document.createTextNode('text');

    nested.append(text);
    await flushMutations();
    text.data = 'longer text';
    await flushMutations();

    expect(events).toEqual(['full', 'check']);

    vi.advanceTimersByTime(MUTATION_SETTLE_DELAY);

    expect(events).toEqual(['full', 'check', 'full']);

    teardown();
  });

  it('restarts the settle delay on every change', async () => {
    const {first, events, teardown} = setup();

    first.className = 'a';
    await flushMutations();
    vi.advanceTimersByTime(MUTATION_SETTLE_DELAY - 1);
    first.className = 'b';
    await flushMutations();
    vi.advanceTimersByTime(MUTATION_SETTLE_DELAY - 1);

    expect(events).toEqual(['check', 'check']);

    vi.advanceTimersByTime(1);

    expect(events).toEqual(['check', 'check', 'full']);

    teardown();
  });

  it('ignores attributes that cannot resize an element', async () => {
    const {first, events, teardown} = setup();

    first.setAttribute('data-state', 'open');
    await flushMutations();
    vi.advanceTimersByTime(MUTATION_SETTLE_DELAY);

    expect(events).toEqual([]);

    teardown();
  });

  it('observes the right children once a class change turns display: contents off', async () => {
    const {wrapper, resizeObserver, teardown} = setup();

    wrapper.className = '';
    await flushMutations();
    vi.advanceTimersByTime(MUTATION_SETTLE_DELAY);

    expect(observedIds(resizeObserver)).toEqual(['content', 'first', 'host', 'wrapper']);

    teardown();
  });
});

describe('NdwuScrollbarContentObserver: disconnect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stops reporting changes and cancels the pending settle', async () => {
    const {content, first, events, observer, resizeObserver, teardown} = setup();

    first.className = 'a';
    await flushMutations();
    observer.disconnect();
    content.append(element('late'));
    await flushMutations();
    vi.advanceTimersByTime(MUTATION_SETTLE_DELAY);

    expect(events).toEqual(['check']);
    expect(resizeObserver.isDisconnected).toBe(true);

    teardown();
  });
});

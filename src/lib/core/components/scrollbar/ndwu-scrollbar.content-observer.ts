// `full`: recalculate everything.
// `check`: recalculate only if the content scroll size changed since the last measurement.
export type NdwuMutationRecalc = 'full' | 'check';

// How long text/class changes must stop before the full recalculation that catches a missed
// shrink. Longer than the gap between changes in a burst (animation, hover over a list),
// short enough that the late shrink still feels like a reaction.
export const MUTATION_SETTLE_DELAY = 150;

// Attributes whose change can resize an element without adding or removing nodes
const OBSERVED_ATTRIBUTES = ['class', 'hidden'];

export interface NdwuContentObserverHandlers {
  // The host changed size. Called before `contentChange('full')` for the same resize.
  readonly hostResize: () => void;
  readonly contentChange: (recalc: NdwuMutationRecalc) => void;
}

export type NdwuResizeObserverFactory = (callback: ResizeObserverCallback) => ResizeObserver;

const createBrowserResizeObserver: NdwuResizeObserverFactory = (callback) => {
  return new ResizeObserver(callback);
};

// Adding or removing a node can change the content size unnoticed by any observer
// (e.g. removing the widest element), so it always needs a full recalculation.
// A text or attribute change only needs a size check: growth shows up in the scroll size,
// and a shrink is reported by ResizeObserver on the children or caught by the full
// recalculation once mutations settle.
export function resolveMutationRecalc(records: ReadonlyArray<Pick<MutationRecord, 'type'>>): NdwuMutationRecalc {
  return records.some(record => record.type === 'childList') ? 'full' : 'check';
}

// An element with `display: contents` has no box of its own, so ResizeObserver never
// reports it. Observe its children instead.
function collectChildren(parent: Element, result: Set<Element>): Set<Element> {
  for (const child of Array.from(parent.children)) {
    if (getComputedStyle(child).display === 'contents') {
      collectChildren(child, result);
    } else {
      result.add(child);
    }
  }

  return result;
}

/**
 * Watches the host and the scrolled content for anything that can change their size and tells
 * the scrollbar how much to recalculate.
 */
export class NdwuScrollbarContentObserver {
  private readonly resizeObserver: ResizeObserver;
  private readonly mutationObserver: MutationObserver;
  private observedChildren = new Set<Element>();
  private settleTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly host: HTMLElement,
    private readonly content: HTMLElement,
    private readonly handlers: NdwuContentObserverHandlers,
    createResizeObserver: NdwuResizeObserverFactory = createBrowserResizeObserver,
  ) {
    this.resizeObserver = createResizeObserver(entries => this.onResize(entries));
    this.resizeObserver.observe(host);
    this.resizeObserver.observe(content);
    this.observeChildren();

    this.mutationObserver = new MutationObserver(records => this.onMutation(records));

    // The content box has a fixed size, so a text or class change deep inside it that doesn't
    // resize a direct child is seen only by this observer.
    this.mutationObserver.observe(
      content,
      {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: OBSERVED_ATTRIBUTES,
      },
    );
  }

  // ResizeObserver calls back right away for a newly observed element. Re-observing the host
  // when the scrollbar is enabled again restores the inline content size at once, instead
  // of waiting for a host resize that may never happen.
  public reobserveHost(): void {
    this.resizeObserver.unobserve(this.host);
    this.resizeObserver.observe(this.host);
  }

  public disconnect(): void {
    if (this.settleTimerId !== null) {
      clearTimeout(this.settleTimerId);
      this.settleTimerId = null;
    }

    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
    this.observedChildren.clear();
  }

  private onResize(entries: ReadonlyArray<ResizeObserverEntry>): void {
    if (entries.some(entry => entry.target === this.host)) {
      this.handlers.hostResize();
    }

    this.handlers.contentChange('full');
  }

  private onMutation(records: ReadonlyArray<MutationRecord>): void {
    if (resolveMutationRecalc(records) === 'full') {
      this.observeChildren();
      this.handlers.contentChange('full');

      return;
    }

    // A full recalculation lays out all the content twice, too slow for frequent text/class
    // changes (timers, hover). Instead, ask for a size check now and for a full recalculation
    // once the changes stop.
    this.handlers.contentChange('check');
    this.scheduleSettle();
  }

  private scheduleSettle(): void {
    if (this.settleTimerId !== null) {
      clearTimeout(this.settleTimerId);
    }

    this.settleTimerId = setTimeout(
      () => {
        this.settleTimerId = null;

        // a class change may have turned `display: contents` on or off for a child
        this.observeChildren();
        this.handlers.contentChange('full');
      },
      MUTATION_SETTLE_DELAY,
    );
  }

  // The content box has a fixed size, but its children don't: their ResizeObserver entries
  // report content growing or shrinking without DOM changes (an image loads, text rewraps).
  private observeChildren(): void {
    const children = collectChildren(this.content, new Set());

    for (const child of this.observedChildren) {
      if (!children.has(child)) {
        this.resizeObserver.unobserve(child);
      }
    }

    for (const child of children) {
      if (!this.observedChildren.has(child)) {
        this.resizeObserver.observe(child);
      }
    }

    this.observedChildren = children;
  }
}

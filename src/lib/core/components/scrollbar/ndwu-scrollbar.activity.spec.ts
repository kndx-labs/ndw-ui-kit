import {describe, expect, it} from 'vitest';
import {type NdwuActivityTimers, NdwuScrollbarActivity} from './ndwu-scrollbar.activity';

class FakeActivityTimers implements NdwuActivityTimers {
  private currentTime = 0;
  private nextId = 1;
  private readonly pending = new Map<number, {callback: () => void; dueAt: number}>();

  public readonly set = (callback: () => void, delayMs: number): number => {
    const id = this.nextId++;

    this.pending.set(id, {callback, dueAt: this.currentTime + delayMs});

    return id;
  };

  public readonly clear = (id: number): void => {
    this.pending.delete(id);
  };

  public readonly now = (): number => this.currentTime;

  public get pendingCount(): number {
    return this.pending.size;
  }

  public advanceBy(durationMs: number): void {
    const target = this.currentTime + durationMs;

    while (true) {
      const next = [...this.pending.entries()]
        .filter(([, timer]) => timer.dueAt <= target)
        .sort(([, a], [, b]) => a.dueAt - b.dueAt)[0];

      if (!next) {
        break;
      }

      const [id, timer] = next;

      this.pending.delete(id);
      this.currentTime = timer.dueAt;
      timer.callback();
    }

    this.currentTime = target;
  }
}

const setup = () => {
  const timers = new FakeActivityTimers();
  const activity = new NdwuScrollbarActivity(1000, timers);

  return {activity, timers};
};

describe('NdwuScrollbarActivity', () => {
  it('starts inactive', () => {
    const {activity, timers} = setup();

    expect(activity.isActive()).toBe(false);
    expect(timers.pendingCount).toBe(0);
  });

  it('expires 1000ms after the latest scroll', () => {
    const {activity, timers} = setup();

    activity.markScroll();
    expect(activity.isActive()).toBe(true);
    timers.advanceBy(999);
    expect(activity.isActive()).toBe(true);
    timers.advanceBy(1);
    expect(activity.isActive()).toBe(false);

    activity.markScroll();
    timers.advanceBy(900);
    activity.markScroll();
    expect(timers.pendingCount).toBe(1);
    timers.advanceBy(999);
    expect(activity.isActive()).toBe(true);
    timers.advanceBy(1);
    expect(activity.isActive()).toBe(false);
  });

  it('keeps one timeout during a burst of scroll events', () => {
    const {activity, timers} = setup();

    for (let index = 0; index < 100; index++) {
      activity.markScroll();

      if (index < 99) {
        timers.advanceBy(5);
      }

      expect(timers.pendingCount).toBe(1);
    }

    timers.advanceBy(999);
    expect(activity.isActive()).toBe(true);
    timers.advanceBy(1);
    expect(activity.isActive()).toBe(false);
  });

  it('holds activity through drag and starts a fresh delay on release', () => {
    const {activity, timers} = setup();

    activity.startDrag();
    expect(activity.isActive()).toBe(true);
    expect(timers.pendingCount).toBe(0);
    timers.advanceBy(2000);
    activity.markScroll();
    expect(activity.isActive()).toBe(true);
    expect(timers.pendingCount).toBe(0);

    activity.endDrag();
    expect(timers.pendingCount).toBe(1);
    timers.advanceBy(999);
    expect(activity.isActive()).toBe(true);
    timers.advanceBy(1);
    expect(activity.isActive()).toBe(false);
  });

  it('cancels the previous scroll deadline when a drag starts', () => {
    const {activity, timers} = setup();

    activity.markScroll();
    timers.advanceBy(999);
    activity.startDrag();
    expect(timers.pendingCount).toBe(0);
    timers.advanceBy(2000);
    expect(activity.isActive()).toBe(true);
  });

  it('reset clears activity and a pending timeout', () => {
    const {activity, timers} = setup();

    activity.markScroll();
    activity.reset();
    expect(activity.isActive()).toBe(false);
    expect(timers.pendingCount).toBe(0);
    timers.advanceBy(2000);
    expect(activity.isActive()).toBe(false);
  });

  it('dispose clears activity and makes later calls no-ops', () => {
    const {activity, timers} = setup();

    activity.markScroll();
    activity.dispose();
    expect(activity.isActive()).toBe(false);
    expect(timers.pendingCount).toBe(0);
    activity.markScroll();
    activity.startDrag();
    activity.endDrag();
    activity.reset();
    timers.advanceBy(2000);
    expect(activity.isActive()).toBe(false);
    expect(timers.pendingCount).toBe(0);
  });
});

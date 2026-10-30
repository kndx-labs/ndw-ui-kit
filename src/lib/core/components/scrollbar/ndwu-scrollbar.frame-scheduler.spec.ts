import {describe, expect, it} from 'vitest';
import {type NdwuAnimationFrames, NdwuFrameScheduler} from './ndwu-scrollbar.frame-scheduler';

class FakeFrames implements NdwuAnimationFrames {
  private nextId = 1;
  private readonly pending = new Map<number, () => void>();

  public readonly request = (callback: () => void): number => {
    const id = this.nextId++;

    this.pending.set(id, callback);

    return id;
  };

  public readonly cancel = (id: number): void => {
    this.pending.delete(id);
  };

  public get pendingCount(): number {
    return this.pending.size;
  }

  public flush(): void {
    const callbacks = Array.from(this.pending.values());

    this.pending.clear();
    callbacks.forEach(callback => callback());
  }
}

const setup = () => {
  const frames = new FakeFrames();
  const scheduler = new NdwuFrameScheduler<'a' | 'b'>(frames);
  const calls: string[] = [];
  const track = (name: string) => {
    return (): void => {
      calls.push(name);
    };
  };

  return {frames, scheduler, calls, track};
};

describe('NdwuFrameScheduler: scheduling', () => {
  it('runs the callback on the next frame, not right away', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('first'));

    expect(calls).toEqual([]);

    frames.flush();

    expect(calls).toEqual(['first']);
  });

  it('ignores a new request while one is pending', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('first'));
    scheduler.schedule('a', track('second'));
    frames.flush();

    expect(calls).toEqual(['first']);
  });

  it('allows the callback to schedule the same key again', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', () => scheduler.schedule('a', track('again')));
    frames.flush();
    frames.flush();

    expect(calls).toEqual(['again']);
  });

  it('keeps different keys independent', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('a'));
    scheduler.schedule('b', track('b'));
    frames.flush();

    expect(calls).toEqual(['a', 'b']);
  });
});

describe('NdwuFrameScheduler: cancelling', () => {
  it('cancels the pending callback of a key', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('a'));
    scheduler.schedule('b', track('b'));
    scheduler.cancel('a');
    frames.flush();

    expect(calls).toEqual(['b']);
  });

  it('lets a cancelled key be scheduled again', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('first'));
    scheduler.cancel('a');
    scheduler.schedule('a', track('second'));
    frames.flush();

    expect(calls).toEqual(['second']);
  });

  it('cancels all pending callbacks', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('a'));
    scheduler.schedule('b', track('b'));
    scheduler.cancelAll();
    frames.flush();

    expect(calls).toEqual([]);
    expect(frames.pendingCount).toBe(0);
  });
});

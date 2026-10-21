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

    scheduler.schedule('a', track('first'), 'debounce');

    expect(calls).toEqual([]);

    frames.flush();

    expect(calls).toEqual(['first']);
  });

  it('replaces the pending callback in debounce mode', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('first'), 'debounce');
    scheduler.schedule('a', track('second'), 'debounce');
    frames.flush();

    expect(calls).toEqual(['second']);
    expect(frames.pendingCount).toBe(0);
  });

  it('keeps the pending callback in throttle mode', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('first'), 'throttle');
    scheduler.schedule('a', track('second'), 'throttle');
    frames.flush();

    expect(calls).toEqual(['first']);
  });

  it('schedules again once the frame has run', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('first'), 'throttle');
    frames.flush();
    scheduler.schedule('a', track('second'), 'throttle');
    frames.flush();

    expect(calls).toEqual(['first', 'second']);
  });

  it('allows the callback to schedule the same key again', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', () => scheduler.schedule('a', track('again'), 'throttle'), 'throttle');
    frames.flush();
    frames.flush();

    expect(calls).toEqual(['again']);
  });

  it('keeps different keys independent', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('a'), 'throttle');
    scheduler.schedule('b', track('b'), 'throttle');
    frames.flush();

    expect(calls).toEqual(['a', 'b']);
  });
});

describe('NdwuFrameScheduler: cancelling', () => {
  it('cancels the pending callback of a key', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('a'), 'debounce');
    scheduler.schedule('b', track('b'), 'debounce');
    scheduler.cancel('a');
    frames.flush();

    expect(calls).toEqual(['b']);
  });

  it('lets a cancelled key be scheduled again in throttle mode', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('first'), 'throttle');
    scheduler.cancel('a');
    scheduler.schedule('a', track('second'), 'throttle');
    frames.flush();

    expect(calls).toEqual(['second']);
  });

  it('does nothing when cancelling a key with nothing pending', () => {
    const {frames, scheduler} = setup();

    expect(() => scheduler.cancel('a')).not.toThrow();
    expect(frames.pendingCount).toBe(0);
  });

  it('cancels all pending callbacks', () => {
    const {frames, scheduler, calls, track} = setup();

    scheduler.schedule('a', track('a'), 'debounce');
    scheduler.schedule('b', track('b'), 'throttle');
    scheduler.cancelAll();
    frames.flush();

    expect(calls).toEqual([]);
    expect(frames.pendingCount).toBe(0);
  });
});

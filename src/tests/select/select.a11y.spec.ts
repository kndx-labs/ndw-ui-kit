import {userEvent} from '@vitest/browser/context';
import {describe, expect, it} from 'vitest';
import {mountSelect} from '../helpers/select';

describe('select accessibility', () => {
  it('SEL-CMP-02 — a required field exposes aria-required', () => {
    const required = mountSelect({required: true});

    expect(required.trigger.getAttribute('aria-required')).toBe('true');

    const optional = mountSelect({required: false});

    expect(optional.trigger.getAttribute('aria-required')).toBeNull();
  });

  it('SEL-ACC-01 — aria-expanded reflects the open state; aria-labelledby names the field', async () => {
    const sel = mountSelect({label: 'Pick', hint: 'Helper'});

    expect(sel.trigger.getAttribute('aria-expanded')).toBe('false');
    expect(sel.trigger.getAttribute('aria-labelledby')).toBeTruthy();

    await sel.open();

    expect(sel.trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('SEL-ACC-02 — ENTER opens the list and ESC closes it', async () => {
    const sel = mountSelect();
    const settle = async (): Promise<void> => {
      sel.fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve));
    };

    sel.trigger.focus();
    await userEvent.keyboard('{Enter}');
    await settle();

    expect(sel.trigger.getAttribute('aria-expanded')).toBe('true');

    await userEvent.keyboard('{Escape}');
    await settle();

    expect(sel.trigger.getAttribute('aria-expanded')).toBe('false');
  });
});

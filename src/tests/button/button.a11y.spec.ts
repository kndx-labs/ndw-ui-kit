import {userEvent} from '@vitest/browser/context';
import {describe, expect, it} from 'vitest';
import {mountButton} from '../helpers/mount';

describe('button accessibility', () => {
  it('BTN-ACC-01 — no accessible name is invented for a text-less button', () => {
    const {host} = mountButton({label: '', content: ''});

    expect(host.getAttribute('aria-label')).toBeNull();
    expect(host.getAttribute('aria-labelledby')).toBeNull();
    expect(host.textContent?.trim()).toBe('');
  });

  it('BTN-ACC-01 — the label input is visible text and is not mapped to aria-label', () => {
    const {host} = mountButton({label: 'Save'});

    expect(host.textContent).toContain('Save');
    expect(host.getAttribute('aria-label')).toBeNull();
  });

  it('BTN-DOD-04 — the host is a native button of type="button"', () => {
    const {host} = mountButton();

    expect(host.tagName).toBe('BUTTON');
    expect(host.getAttribute('type')).toBe('button');
  });

  it('BTN-ACC-03 — the native button is focusable without an explicit tabindex', () => {
    const {host} = mountButton();

    expect(host.getAttribute('tabindex')).toBeNull();
    host.focus();
    expect(document.activeElement).toBe(host);
  });

  it('BTN-ACC-03 — a disabled button is not focusable', () => {
    const {host} = mountButton({disabled: true});

    host.focus();

    expect(document.activeElement).not.toBe(host);
  });

  it('BTN-ACC-04 — TAB moves focus to the button', async () => {
    const {host} = mountButton();

    await userEvent.tab();

    expect(document.activeElement).toBe(host);
  });

  it.each<['{Enter}' | ' ', string]>([
    ['{Enter}', 'ENTER'],
    [' ', 'SPACE'],
  ])('BTN-ACC-04 — %s activates the button (%s)', async (key) => {
    const {host} = mountButton();
    let clicks = 0;

    host.addEventListener('click', () => {
      clicks += 1;
    });

    await userEvent.tab();
    await userEvent.keyboard(key);

    expect(clicks).toBe(1);
  });

  it('BTN-ACC-05 — loading sets no aria-busy and does not block keyboard activation', async () => {
    const {host} = mountButton({loading: true});
    let clicks = 0;

    host.addEventListener('click', () => {
      clicks += 1;
    });

    expect(host.getAttribute('aria-busy')).toBeNull();

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(clicks).toBe(1);
  });
});

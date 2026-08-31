import {userEvent} from '@vitest/browser/context';
import {describe, expect, it} from 'vitest';
import {BUTTON_VARIANT, ICON_NAME} from '@ndw-ui-kit/core';
import {mountButton} from '../helpers/mount';

describe('button behaviour', () => {
  it('BTN-VAR-01 — the component exposes the coded variant set', () => {
    expect(Object.values(BUTTON_VARIANT)).toEqual([
      'primary',
      'secondary',
      'tertiary',
      'ghost',
      'secondary-negative',
    ]);
  });

  it('BTN-CMP-01 — renders an icon slot and a label slot', () => {
    const {host} = mountButton({icon: ICON_NAME.ADD_L, label: 'Add'});

    expect(host.querySelector('ndwu-icon')).not.toBeNull();
    expect(host.textContent).toContain('Add');
  });

  it('BTN-CMP-01 — renders projected content when no label input is set', () => {
    const {host} = mountButton({label: '', content: 'Projected'});

    expect(host.textContent).toContain('Projected');
  });

  it('BTN-CMP-02 — loading hides the icon, shows the loader, keeps the label', () => {
    const {host, update} = mountButton({icon: ICON_NAME.ADD_L, label: 'Add'});

    expect(host.querySelector('ndwu-icon')).not.toBeNull();
    expect(host.querySelector('ndwu-spokes-loader')).toBeNull();

    update({loading: true});

    expect(host.querySelector('ndwu-icon')).toBeNull();
    expect(host.querySelector('ndwu-spokes-loader')).not.toBeNull();
    expect(host.textContent).toContain('Add');
  });

  it('BTN-STA-01 — the default state carries the variant and size classes', () => {
    const {host} = mountButton();

    expect(host.classList.contains('ndwu-button')).toBe(true);
    expect(host.classList.contains('ndwu-button--primary')).toBe(true);
    expect(host.classList.contains('ndwu-button--XL')).toBe(true);
  });

  it('BTN-STA-01 — hover changes the rendered background', async () => {
    const {host, styles} = mountButton({variant: BUTTON_VARIANT.PRIMARY});
    const resting = styles().backgroundColor;

    await userEvent.hover(host);

    expect(styles().backgroundColor).not.toBe(resting);
  });

  it('BTN-STA-01 — the disabled and loading states are reflected as classes', () => {
    const {host, update} = mountButton();

    update({disabled: true});
    expect(host.classList.contains('ndwu-button--disabled')).toBe(true);

    update({disabled: false, loading: true});
    expect(host.classList.contains('ndwu-button--loading')).toBe(true);
  });

  it('BTN-STA-02 — disabled uses the native attribute and not-allowed cursor', () => {
    const {host, styles} = mountButton({disabled: true});

    expect(host.disabled).toBe(true);
    expect(styles().cursor).toBe('not-allowed');
  });

  it('BTN-STA-02 — a disabled button cannot be activated', () => {
    const {host} = mountButton({disabled: true});
    let clicks = 0;
    host.addEventListener('click', () => {
      clicks += 1;
    });

    // Programmatic click, not userEvent: Playwright waits for actionability on a
    // disabled element and would stall the test rather than fail it.
    host.click();

    expect(clicks).toBe(0);
  });

  it('BTN-STA-03 — loading blocks pointer events without setting native disabled', () => {
    const {host, styles} = mountButton({loading: true});

    expect(styles().pointerEvents).toBe('none');
    expect(host.disabled).toBe(false);
    expect(host.getAttribute('aria-busy')).toBeNull();
  });
});

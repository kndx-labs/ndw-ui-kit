import {ApplicationRef, type Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {page} from '@vitest/browser/context';
import {firstValueFrom} from 'rxjs';
import {afterEach, beforeAll} from 'vitest';
import {
  NdwuModalService,
  type NdwuAlertModalConfig,
  type NdwuModalConfig,
  type NdwuModalRef,
} from '@ndw-ui-kit/core';

export interface OpenedDialog {
  ref: NdwuModalRef<unknown>;
  panel: HTMLElement;
  styles: () => CSSStyleDeclaration;
}

// Overlay + scroll-lock state is process-wide static (MobileScrollLockStrategy
// holds it), so a leaked-open modal poisons document.body overflow across
// files in the worker. We track every ref we open and close them all in
// afterEach — there is no closeAll API on the service. Registered here (only
// reachable via a spec file) rather than in setup.ts, for the same
// tsconfig-path-resolution reason as helpers/mount.ts.
const opened: NdwuModalRef<unknown>[] = [];

// Dialog rules are specified for the desktop breakpoint; the default test
// iframe is mobile-width (~414px), which flips the mobile media query (title
// steps to 20px, dialog goes full-screen). Pin a desktop viewport so specs
// assert the desktop dialog. Mobile-specific rules are it.todo.
beforeAll(async () => {
  await page.viewport(1280, 800);
});

const settle = async (): Promise<void> => {
  await TestBed.inject(ApplicationRef).whenStable();
  await new Promise((resolve) => setTimeout(resolve));  // flush afterNextRender autofocus
};

// Await each ref's afterClosed$ (not just a macrotask): a dialog closes
// synchronously, but a drawer animates out and disposes the overlay only when
// the close animation (or its ~350ms fallback) finishes. Refs already closed by
// the test (ESC/backdrop) are skipped — their subject has completed.
afterEach(async () => {
  const closing = opened.splice(0)
    .filter((ref) => ref.isVisible())
    .map((ref) => {
      const done = firstValueFrom(ref.afterClosed$);

      ref.close();

      return done;
    });

  await Promise.all(closing);
  await settle();

  if (getComputedStyle(document.body).overflow === 'hidden') {
    throw new Error('modal teardown leaked scroll-lock: document.body overflow still "hidden"');
  }
});

const readPanel = (): HTMLElement => {
  const panel = document.querySelector<HTMLElement>('.ndwu-dialog, .ndwu-drawer');

  if (!panel) {
    throw new Error('open: no .ndwu-dialog / .ndwu-drawer rendered in the overlay');
  }

  return panel;
};

const track = async (ref: NdwuModalRef<unknown>): Promise<OpenedDialog> => {
  opened.push(ref);
  await settle();

  const panel = readPanel();

  return {ref, panel, styles: () => getComputedStyle(panel)};
};

export const openAlert = (config: NdwuAlertModalConfig): Promise<OpenedDialog> => {
  return track(TestBed.inject(NdwuModalService).alert(config) as NdwuModalRef<unknown>);
};

export const openDialog = (content: Type<unknown>, config?: NdwuModalConfig): Promise<OpenedDialog> => {
  return track(TestBed.inject(NdwuModalService).openDialog(content, config));
};

export const openDrawer = (content: Type<unknown>, config?: NdwuModalConfig): Promise<OpenedDialog> => {
  return track(TestBed.inject(NdwuModalService).openDrawer(content, config));
};

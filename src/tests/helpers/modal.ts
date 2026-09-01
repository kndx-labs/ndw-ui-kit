import {ApplicationRef, type Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {afterEach} from 'vitest';
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

const settle = async (): Promise<void> => {
  await TestBed.inject(ApplicationRef).whenStable();
  await new Promise((resolve) => setTimeout(resolve));  // flush afterNextRender autofocus
};

afterEach(async () => {
  while (opened.length > 0) {
    opened.pop()?.close();
  }

  await settle();

  if (getComputedStyle(document.body).overflow === 'hidden') {
    throw new Error('modal teardown leaked scroll-lock: document.body overflow still "hidden"');
  }
});

const readPanel = (): HTMLElement => {
  const panel = document.querySelector<HTMLElement>('.ndwu-dialog');

  if (!panel) {
    throw new Error('openDialog: no .ndwu-dialog was rendered in the overlay');
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

import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {afterEach} from 'vitest';
import {BUTTON_VARIANT, NdwuButtonComponent, type ButtonVariant, type IconName, type Size} from '@ndw-ui-kit/core';

export interface ButtonState {
  variant: ButtonVariant;
  size: Size | undefined;
  disabled: boolean;
  loading: boolean;
  icon: IconName | null;
  label: string;
  content: string;
}

const DEFAULT_STATE: ButtonState = {
  variant: BUTTON_VARIANT.PRIMARY,
  size: undefined,
  disabled: false,
  loading: false,
  icon: null,
  label: '',
  content: 'Button',
};

@Component({
  selector: 'ndwu-test-button-host',
  imports: [NdwuButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      ndwu-button
      [variant]="state().variant"
      [size]="state().size"
      [disabled]="state().disabled"
      [loading]="state().loading"
      [icon]="state().icon"
      [label]="state().label"
    >{{ state().content }}</button>
  `,
})
export class ButtonHostComponent {
  public readonly state = signal<ButtonState>(DEFAULT_STATE);
}

export interface MountedButton {
  fixture: ComponentFixture<ButtonHostComponent>;
  host: HTMLButtonElement;
  styles: () => CSSStyleDeclaration;
  update: (patch: Partial<ButtonState>) => void;
}

// Tracked and torn down in the module-scoped afterEach below, rather than in
// src/tests/setup.ts: setupFiles are loaded directly by Vite's dev pipeline,
// not the Angular-aware esbuild bundle that resolves the "@ndw-ui-kit/core"
// tsconfig path — only files reachable from a *.spec.ts entry point get that
// resolution. Registering the hook here, where this module is only ever
// reached via a spec file, sidesteps that without needing every spec file to
// wire its own teardown.
const mounted: ComponentFixture<ButtonHostComponent>[] = [];

afterEach(() => {
  while (mounted.length > 0) {
    const fixture = mounted.pop();

    if (!fixture) {
      continue;
    }

    (fixture.nativeElement as HTMLElement).remove();
    fixture.destroy();
  }
});

export const mountButton = (patch: Partial<ButtonState> = {}): MountedButton => {
  const fixture = TestBed.createComponent(ButtonHostComponent);
  const rootElement = fixture.nativeElement as HTMLElement;

  fixture.componentInstance.state.set({...DEFAULT_STATE, ...patch});
  document.body.appendChild(rootElement);
  fixture.detectChanges();
  mounted.push(fixture);

  const host = rootElement.querySelector<HTMLButtonElement>('button');

  if (!host) {
    throw new Error('mountButton: no <button> was rendered in the host template');
  }

  return {
    fixture,
    host,
    styles: () => getComputedStyle(host),
    update: (next: Partial<ButtonState>): void => {
      fixture.componentInstance.state.update((current) => ({...current, ...next}));
      fixture.detectChanges();
    },
  };
};

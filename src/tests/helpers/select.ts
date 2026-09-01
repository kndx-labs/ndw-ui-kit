import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {page, userEvent} from '@vitest/browser/context';
import {afterEach, beforeAll} from 'vitest';
import {type NdwuOption} from '@ndw-ui-kit/core';
import {NdwuSelectFieldComponent} from '@ndw-ui-kit/core/form-field';

export interface SelectState {
  size: 'XXL' | 'XL' | 'L' | undefined;
  label: string;
  placeholder: string;
  hint: string;
  required: boolean;
  options: NdwuOption[];
}

const DEFAULT_STATE: SelectState = {
  size: undefined,
  label: 'Pick',
  placeholder: 'Choose…',
  hint: '',
  required: false,
  options: [
    {value: 'a', label: 'Alpha'},
    {value: 'b', label: 'Bravo'},
  ],
};

@Component({
  selector: 'ndwu-test-select-host',
  imports: [ReactiveFormsModule, NdwuSelectFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ndwu-select-field
      [formControl]="ctrl"
      [size]="state().size"
      [label]="state().label"
      [placeholder]="state().placeholder"
      [hint]="state().hint"
      [required]="state().required"
      [options]="state().options"
    />
  `,
})
export class SelectHostComponent {
  public readonly ctrl = new FormControl<string | number | null>(null);
  public readonly state = signal<SelectState>(DEFAULT_STATE);
}

export interface MountedSelect {
  fixture: ComponentFixture<SelectHostComponent>;
  trigger: HTMLElement;
  triggerStyles: () => CSSStyleDeclaration;
  open: () => Promise<void>;
  panel: () => HTMLElement | null;
  options: () => HTMLElement[];
}

// Select rules are specified for desktop; the default test iframe is
// mobile-width (~414px), which makes the dropdown render as the mobile bottom
// sheet instead of the desktop anchored panel. Pin a desktop viewport so specs
// assert the desktop select. Mobile-specific rules are it.todo.
beforeAll(async () => {
  await page.viewport(1280, 800);
});

const mounted: ComponentFixture<SelectHostComponent>[] = [];

afterEach(() => {
  while (mounted.length > 0) {
    const fixture = mounted.pop();

    fixture?.destroy();
    (fixture?.nativeElement as HTMLElement | undefined)?.remove();
  }
});

const readTrigger = (root: HTMLElement): HTMLElement => {
  const trigger = root.querySelector<HTMLElement>('.ndwu-select-field__trigger');

  if (!trigger) {
    throw new Error('mountSelect: no .ndwu-select-field__trigger rendered');
  }

  return trigger;
};

export const mountSelect = (patch: Partial<SelectState> = {}): MountedSelect => {
  const fixture = TestBed.createComponent(SelectHostComponent);
  const root = fixture.nativeElement as HTMLElement;

  fixture.componentInstance.state.set({...DEFAULT_STATE, ...patch});
  document.body.appendChild(root);
  fixture.detectChanges();
  mounted.push(fixture);

  const trigger = readTrigger(root);

  return {
    fixture,
    trigger,
    triggerStyles: () => getComputedStyle(trigger),
    open: async (): Promise<void> => {
      await userEvent.click(trigger);
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve));
    },
    panel: () => document.querySelector<HTMLElement>('.ndwu-dropdown-panel'),
    options: () => Array.from(document.querySelectorAll<HTMLElement>('ndwu-styled-option')),
  };
};

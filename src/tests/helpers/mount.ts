import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {ComponentFixture} from '@angular/core/testing';
import {BUTTON_VARIANT, NdwuButtonComponent, type ButtonVariant, type IconName, type Size} from '@ndw-ui-kit/core';
import {must} from './dom';
import {createTrackedHost} from './fixture';

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

export const mountButton = (patch: Partial<ButtonState> = {}): MountedButton => {
  const fixture = createTrackedHost(ButtonHostComponent);
  const root = fixture.nativeElement as HTMLElement;

  fixture.componentInstance.state.set({...DEFAULT_STATE, ...patch});
  fixture.detectChanges();

  const host = must<HTMLButtonElement>(root, 'button', 'mountButton');

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

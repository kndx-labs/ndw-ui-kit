import {Component, effect, input} from '@angular/core';
import {FormControl, ReactiveFormsModule, type ValidatorFn} from '@angular/forms';
import {SIZE, type Size} from '@ndw-ui-kit/core';
import {NdwuInputFieldComponent} from '@ndw-ui-kit/core/form-field';

// Compatible with the library's default `NDWU_VALIDATION_PROCESSOR`, which
// extracts `Object.values(errors)[0].errorLabel` as the displayed message.
//
// Deliberately keyed `customRequired`, not `required`: binding `[required]`
// alongside `[formControl]` on the same element (as the render template
// below does) also activates Angular's own built-in `RequiredValidator`
// directive, which contributes a plain `{required: true}` error. Angular
// composes that alongside any validator we set via `setValidators`, and
// since both would use the `required` key, one clobbers the other in the
// combined errors object, leaving `Object.values(errors)[0]` pointing at
// whichever one wins - unpredictably losing our `errorLabel`. Using a
// distinct key sidesteps the collision entirely. This mirrors how the
// library's own playground app avoids the same collision (see
// `src/playground/app/validation/validation.constants.ts`'s
// `ERROR_KEY.REQUIRED = 'REQUIRED'`, deliberately not `'required'`).
const requiredWithLabel: ValidatorFn = (control) => {
  return control.value === ''
    ? {customRequired: {errorLabel: 'This field is required'}}
    : null;
};

/**
 * Story-only host around `NdwuInputFieldComponent`. Storybook args are plain
 * primitives (Controls can't drive a `FormControl` directly), so this host
 * owns a real `FormControl` and synchronizes it from signal inputs. `initialValue`,
 * `disabled`, and `showValidation` are
 * story-host controls only — they are not inputs of `NdwuInputFieldComponent`
 * itself, they just seed/drive the host's own `FormControl`.
 */
@Component({
  selector: 'app-input-field-story',
  imports: [ReactiveFormsModule, NdwuInputFieldComponent],
  template: `
    <div class="storybook-field">
      <ndwu-input-field
        [formControl]="control"
        [label]="label()"
        [placeholder]="placeholder()"
        [hint]="hint()"
        [size]="size()"
        [required]="required()"
        [readonly]="readonly()"
        [type]="type()"
        showPasswordIconLabel="Show password"
        hidePasswordIconLabel="Hide password"
      />
      <p>Value: <output data-testid="form-value">{{ control.value }}</output></p>
    </div>
  `,
})
export class InputFieldStoryComponent {
  public readonly label = input('Name');
  public readonly placeholder = input('');
  public readonly hint = input('');
  public readonly size = input<Size>(SIZE.XL);
  public readonly required = input(false);
  public readonly readonly = input(false);
  public readonly type = input<'text' | 'password'>('text');

  // Story-host-only controls (not `NdwuInputFieldComponent` inputs):
  public readonly initialValue = input('');
  public readonly disabled = input(false);
  public readonly showValidation = input(false);

  public readonly control = new FormControl('', {nonNullable: true});

  constructor() {
    effect(() => {
      this.control.setValue(this.initialValue());
    });

    effect(() => {
      this.control.setValidators(this.required() ? [requiredWithLabel] : []);

      if (this.showValidation()) {
        this.control.markAsTouched();
      } else {
        this.control.markAsUntouched();
      }

      this.control.updateValueAndValidity();
    });

    effect(() => {
      if (this.disabled()) {
        this.control.disable();
      } else {
        this.control.enable();
      }

      this.control.updateValueAndValidity();
    });
  }
}

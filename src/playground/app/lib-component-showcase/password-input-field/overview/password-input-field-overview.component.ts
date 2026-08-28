import {ChangeDetectionStrategy, Component, computed} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';
import {NdwuPasswordInputFieldComponent} from '@ndw-ui-kit/core/form-field';
import {type NdwuPasswordStrength} from '@ndw-ui-kit/core';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {ShowcaseLayoutComponent} from '@app/components';

@Component({
  selector: 'app-password-input-field-overview',
  templateUrl: './password-input-field-overview.component.html',
  styleUrl: './password-input-field-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    LocalizePipe,
    NdwuPasswordInputFieldComponent,
    ShowcaseLayoutComponent,
  ],
})
export class PasswordInputFieldOverviewComponent {
  public readonly defaultForm = new FormGroup({
    password: new FormControl(''),
  });

  public readonly weakForm = new FormGroup({
    password: new FormControl('abc'),
  });

  public readonly averageForm = new FormGroup({
    password: new FormControl('abcdef'),
  });

  public readonly strongForm = new FormGroup({
    password: new FormControl('abcdefghij'),
  });

  private readonly defaultPasswordValue = toSignal(
    this.defaultForm.controls.password.valueChanges,
    {initialValue: ''},
  );

  private readonly weakPasswordValue = toSignal(
    this.weakForm.controls.password.valueChanges,
    {initialValue: 'abc'},
  );

  private readonly averagePasswordValue = toSignal(
    this.averageForm.controls.password.valueChanges,
    {initialValue: 'abcdef'},
  );

  private readonly strongPasswordValue = toSignal(
    this.strongForm.controls.password.valueChanges,
    {initialValue: 'abcdefghij'},
  );

  public readonly getPasswordStrength = (password: string): NdwuPasswordStrength | null => {
    if (!password || password.length === 0) {
      return null; // default state
    }

    const length = password.length;

    if (length <= 4) {
      return 'weak';
    }

    if (length <= 8) {
      return 'average';
    }

    return 'strong';
  };

  public readonly defaultPasswordStrength = computed(() => {
    return this.getPasswordStrength(this.defaultPasswordValue() ?? '');
  });

  public readonly weakPasswordStrength = computed(() => {
    return this.getPasswordStrength(this.weakPasswordValue() ?? '');
  });

  public readonly averagePasswordStrength = computed(() => {
    return this.getPasswordStrength(this.averagePasswordValue() ?? '');
  });

  public readonly strongPasswordStrength = computed(() => {
    return this.getPasswordStrength(this.strongPasswordValue() ?? '');
  });
}

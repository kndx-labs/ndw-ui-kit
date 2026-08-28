import {Component, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NdwuButtonComponent,
  NdwuEmptyStateComponent,
  PICTOGRAM_NAME,
  PICTOGRAM_VARIANTS,
  PictogramBaseName,
  PictogramVariant,
} from '@ndw-ui-kit/core';
import {ThemeSwitcherComponent} from '@app/components';

@Component({
  selector: 'app-empty-state-sandbox',
  templateUrl: './empty-state-sandbox.component.html',
  styleUrl: './empty-state-sandbox.component.scss',
  imports: [ReactiveFormsModule, NdwuEmptyStateComponent, NdwuButtonComponent, ThemeSwitcherComponent],
})
export class EmptyStateSandboxComponent {
  public readonly PICTOGRAM_NAME = PICTOGRAM_NAME;
  public readonly PICTOGRAM_VARIANTS = PICTOGRAM_VARIANTS;
  public readonly pictogramOptions = [
    ...new Set(
      Object.values(PICTOGRAM_NAME).map((name) => name.replace(/_(L|XL)$/, '')),
    ),
  ] as PictogramBaseName[];
  public readonly variantOptions = Object.keys(PICTOGRAM_VARIANTS) as unknown as PictogramVariant[];

  public readonly sandboxTheme = signal<string>('light');

  public readonly sandboxForm = new FormGroup({
    pictogram: new FormControl<PictogramBaseName>('pictogram_connection1'),
    pictogramVariant: new FormControl<PictogramVariant>('DEFAULT'),
    title: new FormControl<string>('Failed to upload'),
    description: new FormControl<string>('Please try again later'),
    showCancel: new FormControl<boolean>(true),
    showRetry: new FormControl<boolean>(true),
  });

  public setSandboxTheme(theme: string): void {
    this.sandboxTheme.set(theme);
  }

  public resetSandbox(): void {
    this.sandboxForm.reset({
      pictogram: 'pictogram_connection1' as PictogramBaseName,
      pictogramVariant: 'DEFAULT' as PictogramVariant,
      title: 'Failed to upload',
      description: 'Please try again later',
      showCancel: true,
      showRetry: true,
    });
  }
}

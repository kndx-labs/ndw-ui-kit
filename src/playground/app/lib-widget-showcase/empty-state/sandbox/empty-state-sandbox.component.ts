import {Component, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  NDWU_PICTOGRAM_NAME,
  NDWU_PICTOGRAM_VARIANTS,
  NdwuButtonComponent,
  NdwuPictogramBaseName,
  NdwuPictogramVariant,
} from '@ndw-ui-kit/core';
import {NdwuEmptyStateComponent} from '@ndw-ui-kit/core/widgets';
import {ThemeSwitcherComponent} from '@app/components';

@Component({
  selector: 'app-empty-state-sandbox',
  templateUrl: './empty-state-sandbox.component.html',
  styleUrl: './empty-state-sandbox.component.scss',
  imports: [ReactiveFormsModule, NdwuEmptyStateComponent, NdwuButtonComponent, ThemeSwitcherComponent],
})
export class EmptyStateSandboxComponent {
  public readonly PICTOGRAM_NAME = NDWU_PICTOGRAM_NAME;
  public readonly PICTOGRAM_VARIANTS = NDWU_PICTOGRAM_VARIANTS;
  public readonly pictogramOptions = [
    ...new Set(
      Object.values(NDWU_PICTOGRAM_NAME).map((name) => name.replace(/_(L|XL)$/, '')),
    ),
  ] as NdwuPictogramBaseName[];
  public readonly variantOptions = Object.keys(NDWU_PICTOGRAM_VARIANTS) as unknown as NdwuPictogramVariant[];

  public readonly sandboxTheme = signal<string>('light');

  public readonly sandboxForm = new FormGroup({
    pictogram: new FormControl<NdwuPictogramBaseName>('pictogram_connection1'),
    pictogramVariant: new FormControl<NdwuPictogramVariant>('DEFAULT'),
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
      pictogram: 'pictogram_connection1' as NdwuPictogramBaseName,
      pictogramVariant: 'DEFAULT' as NdwuPictogramVariant,
      title: 'Failed to upload',
      description: 'Please try again later',
      showCancel: true,
      showRetry: true,
    });
  }
}

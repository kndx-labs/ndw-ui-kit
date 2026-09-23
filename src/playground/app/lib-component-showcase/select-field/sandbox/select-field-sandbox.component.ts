import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {type NdwuSize, SIZE} from '@ndw-ui-kit/core';
import {NdwuSelectFieldComponent} from '@ndw-ui-kit/core/form-field';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {parseTextareaOptions} from '@app/utils';
import {STRETCH_WIDTH_VALUE, SandboxToolbarComponent} from '@app/components';
import type {SandboxTheme} from '@app/lib-component-showcase/component-showcase.types';

const DEFAULT_OPTIONS_TEXT = 'Germany\nSwitzerland\nAustria\nFrance\nItaly';

@Component({
  selector: 'app-select-field-sandbox',
  templateUrl: './select-field-sandbox.component.html',
  styleUrl: './select-field-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuSelectFieldComponent,
    LocalizePipe,
    SandboxToolbarComponent,
  ],
})
export class SelectFieldSandboxComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly SIZE = SIZE;
  protected readonly sandboxTheme = signal<SandboxTheme>('light');
  protected readonly options = signal<ReturnType<typeof parseTextareaOptions>>([]);
  protected readonly sandboxToolbar = viewChild(SandboxToolbarComponent);
  protected readonly previewWidth = signal<string>(STRETCH_WIDTH_VALUE);

  protected readonly sandboxForm = new FormGroup({
    label: new FormControl('Country', {nonNullable: true}),
    placeholder: new FormControl('Choose country', {nonNullable: true}),
    hint: new FormControl('', {nonNullable: true}),
    size: new FormControl<NdwuSize>(SIZE.XL, {nonNullable: true}),
    disabled: new FormControl(false, {nonNullable: true}),
    required: new FormControl(false, {nonNullable: true}),
    optionsRaw: new FormControl(DEFAULT_OPTIONS_TEXT, {nonNullable: true}),
    selectValue: new FormControl<string>('', {nonNullable: true}),
  });

  public ngOnInit(): void {
    this.options.set(parseTextareaOptions(this.sandboxForm.controls.optionsRaw.value));
    this.sandboxForm.controls.optionsRaw.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((text) => this.options.set(parseTextareaOptions(text)));

    this.syncPreviewState();
    this.sandboxForm.controls.disabled.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncPreviewState());
    this.sandboxForm.controls.required.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncPreviewState());
  }

  public ngAfterViewInit(): void {
    this.previewWidth.set(this.sandboxToolbar()?.width() ?? STRETCH_WIDTH_VALUE);
  }

  protected onWidthChange(width: string): void {
    this.previewWidth.set(width);
  }

  private syncPreviewState(): void {
    const selectCtrl = this.sandboxForm.controls.selectValue;

    if (this.sandboxForm.controls.disabled.value) {
      selectCtrl.disable();
    } else {
      selectCtrl.enable();
    }

    if (this.sandboxForm.controls.required.value) {
      selectCtrl.setValidators(Validators.required);
    } else {
      selectCtrl.clearValidators();
    }

    selectCtrl.updateValueAndValidity();
  }

  protected setSandboxTheme(theme: SandboxTheme): void {
    this.sandboxTheme.set(theme);
  }

  protected resetSandbox(): void {
    this.sandboxTheme.set('light');
    this.sandboxForm.reset({
      label: 'Country',
      placeholder: 'Choose country',
      hint: '',
      size: SIZE.XL,
      disabled: false,
      required: false,
      optionsRaw: DEFAULT_OPTIONS_TEXT,
      selectValue: '',
    });
    this.options.set(parseTextareaOptions(DEFAULT_OPTIONS_TEXT));
  }
}

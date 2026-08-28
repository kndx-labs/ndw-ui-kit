import {ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal} from '@angular/core';
import {CommonModule, JsonPipe} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ICON_NAME, NdwuIconComponent, NdwuOption, SIZE, type Size} from '@ndw-ui-kit/core';
import {NdwuMultiSelectDisplayDirective, NdwuMultiSelectFieldComponent} from '@ndw-ui-kit/core/form-field';
import {ThemeSwitcherComponent} from '@app/components';
import {parseTextareaOptions} from '@app/utils';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import type {SandboxTheme} from '@app/lib-component-showcase/component-showcase.types';

const DEFAULT_OPTIONS_TEXT = 'Germany\nSwitzerland\nAustria\nFrance\nItaly';

type DisplayMode = 'default' | 'count' | 'chips';

@Component({
  selector: 'app-multi-select-field-sandbox',
  templateUrl: './multi-select-field-sandbox.component.html',
  styleUrl: './multi-select-field-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonPipe,
    NdwuIconComponent,
    NdwuMultiSelectFieldComponent,
    LocalizePipe,
    ThemeSwitcherComponent,
    NdwuMultiSelectDisplayDirective,
  ],
})
export class MultiSelectFieldSandboxComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly SIZE = SIZE;
  protected readonly ICON_NAME = ICON_NAME;
  protected readonly sandboxTheme = signal<SandboxTheme>('light');
  protected readonly options = signal<ReturnType<typeof parseTextareaOptions>>([]);

  protected readonly sandboxForm = new FormGroup({
    label: new FormControl('Countries', {nonNullable: true}),
    placeholder: new FormControl('Pick countries', {nonNullable: true}),
    hint: new FormControl('', {nonNullable: true}),
    size: new FormControl<Size>(SIZE.L, {nonNullable: true}),
    cancelLabel: new FormControl('Cancel', {nonNullable: true}),
    confirmLabel: new FormControl('Confirm', {nonNullable: true}),
    disabled: new FormControl(false, {nonNullable: true}),
    required: new FormControl(false, {nonNullable: true}),
    displayMode: new FormControl<DisplayMode>('default', {nonNullable: true}),
    optionsRaw: new FormControl(DEFAULT_OPTIONS_TEXT, {nonNullable: true}),
    selectValue: new FormControl<string[]>([], {nonNullable: true}),
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

  protected deselect(opt: NdwuOption, event: Event): void {
    const value = this.sandboxForm.controls.selectValue.value;
    const newValue = value.filter((v) => v !== opt.value);

    this.sandboxForm.controls.selectValue.setValue(newValue);
    event.stopPropagation();
  }

  protected setSandboxTheme(theme: SandboxTheme): void {
    this.sandboxTheme.set(theme);
  }

  protected resetSandbox(): void {
    this.sandboxTheme.set('light');
    this.sandboxForm.reset({
      label: 'Countries',
      placeholder: 'Pick countries',
      hint: '',
      size: SIZE.L,
      cancelLabel: 'Cancel',
      confirmLabel: 'Confirm',
      disabled: false,
      required: false,
      displayMode: 'default',
      optionsRaw: DEFAULT_OPTIONS_TEXT,
      selectValue: [],
    });
    this.options.set(parseTextareaOptions(DEFAULT_OPTIONS_TEXT));
  }
}

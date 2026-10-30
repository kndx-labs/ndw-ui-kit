import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NDWU_SIZE, type NdwuAutocompleteOption, NdwuLinkComponent, type NdwuSize} from '@ndw-ui-kit/core';
import {
  NdwuAutocompleteFieldComponent,
  NdwuAutocompleteFooterDirective,
  NdwuValidators,
} from '@ndw-ui-kit/core/form-field';
import {NdwuLocalizePipe} from '@ndw-ui-kit/core/l10n';
import {parseTextareaOptions} from '@app/utils';
import {STRETCH_WIDTH_VALUE, SandboxToolbarComponent} from '@app/components';
import type {SandboxTheme} from '@app/lib-component-showcase/component-showcase.types';
import {knowledgeBaseSearchUrl} from '../autocomplete-showcase.data';

const DEFAULT_OPTIONS_TEXT = 'Amsterdam\nBerlin\nBern\nBrussels\nMunich\nParis\nPrague\nVienna\nZurich';

const DEFAULT_FORM_VALUES = {
  label: 'City',
  placeholder: 'Start typing a city',
  hint: '',
  size: NDWU_SIZE.XL as NdwuSize,
  disabled: false,
  readonly: false,
  required: false,
  footer: false,
  optionsRaw: DEFAULT_OPTIONS_TEXT,
  value: '',
};

@Component({
  selector: 'app-autocomplete-sandbox',
  templateUrl: './autocomplete-sandbox.component.html',
  styleUrl: './autocomplete-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NdwuAutocompleteFieldComponent,
    NdwuAutocompleteFooterDirective,
    NdwuLinkComponent,
    NdwuLocalizePipe,
    SandboxToolbarComponent,
  ],
})
export class AutocompleteSandboxComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly SIZE = NDWU_SIZE;
  protected readonly knowledgeBaseSearchUrl = knowledgeBaseSearchUrl;
  protected readonly sandboxTheme = signal<SandboxTheme>('light');
  protected readonly sandboxToolbar = viewChild(SandboxToolbarComponent);
  protected readonly previewWidth = signal<string>(STRETCH_WIDTH_VALUE);
  protected readonly optionsRaw = signal<string>(DEFAULT_OPTIONS_TEXT);
  protected readonly lastSelected = signal<NdwuAutocompleteOption | null>(null);

  protected readonly options = computed<NdwuAutocompleteOption[]>(() => parseTextareaOptions(this.optionsRaw()));

  protected readonly sandboxForm = new FormGroup({
    label: new FormControl(DEFAULT_FORM_VALUES.label, {nonNullable: true}),
    placeholder: new FormControl(DEFAULT_FORM_VALUES.placeholder, {nonNullable: true}),
    hint: new FormControl(DEFAULT_FORM_VALUES.hint, {nonNullable: true}),
    size: new FormControl<NdwuSize>(DEFAULT_FORM_VALUES.size, {nonNullable: true}),
    disabled: new FormControl(DEFAULT_FORM_VALUES.disabled, {nonNullable: true}),
    readonly: new FormControl(DEFAULT_FORM_VALUES.readonly, {nonNullable: true}),
    required: new FormControl(DEFAULT_FORM_VALUES.required, {nonNullable: true}),
    footer: new FormControl(DEFAULT_FORM_VALUES.footer, {nonNullable: true}),
    optionsRaw: new FormControl(DEFAULT_FORM_VALUES.optionsRaw, {nonNullable: true}),
    value: new FormControl(DEFAULT_FORM_VALUES.value, {nonNullable: true}),
  });

  public ngOnInit(): void {
    this.sandboxForm.controls.optionsRaw.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((text) => this.optionsRaw.set(text));

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

  protected setSandboxTheme(theme: SandboxTheme): void {
    this.sandboxTheme.set(theme);
  }

  protected resetSandbox(): void {
    this.sandboxTheme.set('light');
    this.sandboxForm.reset(DEFAULT_FORM_VALUES);
    this.lastSelected.set(null);
  }

  private syncPreviewState(): void {
    const valueCtrl = this.sandboxForm.controls.value;

    if (this.sandboxForm.controls.disabled.value) {
      valueCtrl.disable();
    } else {
      valueCtrl.enable();
    }

    if (this.sandboxForm.controls.required.value) {
      valueCtrl.setValidators(NdwuValidators.required());
    } else {
      valueCtrl.clearValidators();
    }

    valueCtrl.updateValueAndValidity();
  }
}

import {Component, booleanAttribute, computed, contentChild, inject, input, signal, viewChild} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {NgControl} from '@angular/forms';
import {
  ICON_NAME,
  NDWU_OPTION_CONFIG,
  NdwuButtonBaseDirective,
  NdwuCheckboxComponent,
  type NdwuControl,
  NdwuControlProviderDirective,
  NdwuDropdownPanelComponent,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  NdwuHintDirective,
  NdwuIconComponent,
  type NdwuOption,
  type NdwuOptionAdapter,
  NdwuPanelFooterDirective,
  NdwuPanelHeaderDirective,
  NdwuResizeObserverDirective,
  NdwuSizeDirective,
  NdwuStyledListboxComponent,
  NdwuStyledOptionComponent,
  SIZE,
  normalizeOptions,
  resolveOptionsAdapter,
} from '@ndw-ui-kit/core';
import {
  NdwuComboboxDirective,
  NdwuComboboxInputDirective,
  NdwuComboboxPopoverBridgeDirective,
} from '@ndw-ui-kit/core/aria';
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NdwuPopoverTriggerDirective} from '@ndw-ui-kit/core/popover';
import {NdwuHelperMessageComponent} from '../helper-message/ndwu-helper-message.component';
import {
  type NdwuMultiSelectDisplayContext,
  NdwuMultiSelectDisplayDirective,
} from './ndwu-multi-select-display.directive';
import {SelectFieldBase} from '../../classes/select-field-base.directive';

@Component({
  selector: 'ndwu-multi-select-field',
  templateUrl: './ndwu-multi-select-field.component.html',
  styleUrl: './ndwu-multi-select-field.component.scss',
  imports: [
    LocalizePipe,
    NdwuButtonBaseDirective,
    NdwuCheckboxComponent,
    NdwuComboboxDirective,
    NdwuComboboxInputDirective,
    NdwuComboboxPopoverBridgeDirective,
    NdwuControlProviderDirective,
    NdwuDropdownPanelComponent,
    NdwuFloatingLabelComponent,
    NdwuFormFieldComponent,
    NdwuHelperMessageComponent,
    NdwuHintDirective,
    NdwuIconComponent,
    NdwuPanelFooterDirective,
    NdwuPanelHeaderDirective,
    NdwuPopoverTriggerDirective,
    NdwuResizeObserverDirective,
    NdwuStyledListboxComponent,
    NdwuStyledOptionComponent,
    NgTemplateOutlet,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuMultiSelectFieldComponent<T = NdwuOption> extends SelectFieldBase<(string | number)[]>
  implements NdwuControl {
  protected readonly ICON_NAME = ICON_NAME;
  protected readonly displayTemplate = contentChild(NdwuMultiSelectDisplayDirective);
  protected readonly diOptionConfig = inject(NDWU_OPTION_CONFIG, {optional: true}) ?? null;

  protected readonly triggerResize = viewChild.required(NdwuResizeObserverDirective);
  protected readonly triggerWidth = computed(() => this.triggerResize().width());

  public readonly label = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly hint = input<string>('');
  public readonly required = input(false, {transform: booleanAttribute});
  public readonly options = input<readonly T[]>([]);
  public readonly optionAdapter = input<NdwuOptionAdapter<T> | undefined>(undefined);
  public readonly showSelectAll = input(true, {transform: booleanAttribute});
  public readonly selectAllLabel = input<string>('Select all');
  public readonly confirmBtnLabel = input<string>('Confirm');
  public readonly closeButtonAriaLabel = input<string>('Close');

  // == NdwuControl ===========================================================
  public get empty(): boolean {
    return !(this.inputValue?.length);
  }

  // == Component-specific ====================================================
  protected readonly pendingSelection = signal<(string | number)[]>([]);

  protected readonly dropdownSize = computed(() => {
    return this.isMobileViewport() ? SIZE.XL : this.sizeSvc.effectiveSize();
  });

  protected readonly normalizedOptions = computed<NdwuOption[]>(() => {
    return normalizeOptions(
      this.options(),
      resolveOptionsAdapter(this.optionAdapter(), this.diOptionConfig),
    );
  });

  protected readonly allSelected = computed(() => {
    const opts = this.normalizedOptions();

    return opts.length > 0 && this.pendingSelection().length === opts.length;
  });

  protected readonly indeterminate = computed(() => {
    const selectedCount = this.pendingSelection().length;

    return selectedCount > 0 && selectedCount < this.normalizedOptions().length;
  });

  protected get displayText(): string {
    // Track pendingSelection signal to ensure reactivity while panel is open
    this.pendingSelection();

    const ids = this.inputValue;
    const opts = this.normalizedOptions();

    if (!ids?.length) {
      return this.placeholder();
    }

    if (ids.length === 1) {
      const id = ids[0];
      const option = opts.find((o) => o.value === id);

      return option?.label ?? String(id);
    }

    return ids
      .map((id) => opts.find((o) => o.value === id)?.label ?? String(id))
      .join(', ');
  }

  protected get displayContext(): NdwuMultiSelectDisplayContext<T> {
    // Track pendingSelection signal to ensure reactivity while panel is open
    this.pendingSelection();

    const ids = this.inputValue ?? [];
    const normalized = this.normalizedOptions();
    const allOpts = this.options();
    const selectedRaw: T[] = [];

    for (let i = 0; i < normalized.length; i++) {
      const norm = normalized[i];
      const raw = allOpts[i];

      if (norm && raw && ids.includes(norm.value)) {
        selectedRaw.push(raw);
      }
    }

    return {
      selectedValues: ids,
      normalizedOptions: normalized,
      selectedOptions: selectedRaw,
      allOptions: allOpts,
      empty: ids.length === 0,
    };
  }

  constructor(
    protected override ngControl: NgControl,
  ) {
    super([], ngControl, 'ndwu-multi-select-trigger-');
  }

  protected override onPanelOpened(): void {
    super.onPanelOpened();
    this.pendingSelection.set(this.inputValue ?? []);
  }

  protected onSelectionChange(values: unknown[]): void {
    const selection = values as (string | number)[];

    this.pendingSelection.set(selection);

    if (!this.isMobileViewport()) {
      this.handleChange(selection);
    }
  }

  protected onConfirm(): void {
    this.handleChange(this.pendingSelection());
    this.combobox()?.close();
  }

  protected onSelectAllChange(checked: boolean): void {
    const newSelection = checked ? this.normalizedOptions().map((o) => o.value) : [];

    this.onSelectionChange(newSelection);
  }

  protected isOptionSelected(value: string | number): boolean {
    return this.pendingSelection().includes(value);
  }
}

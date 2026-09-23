import {Component, booleanAttribute, computed, inject, input, viewChild} from '@angular/core';
import {NgControl} from '@angular/forms';
import {
  NDWU_ICON_NAME,
  NDWU_OPTION_CONFIG,
  NDWU_SIZE,
  type NdwuControl,
  NdwuControlProviderDirective,
  NdwuDropdownPanelComponent,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  NdwuHintDirective,
  NdwuIconButtonComponent,
  NdwuIconComponent,
  type NdwuOption,
  type NdwuOptionAdapter,
  NdwuPanelHeaderDirective,
  NdwuResizeObserverDirective,
  NdwuSizeDirective,
  NdwuStyledGroupHeaderComponent,
  NdwuStyledListboxComponent,
  NdwuStyledOptionComponent,
  ndwuNormalizeOptions,
  ndwuResolveOptionsAdapter,
} from '@ndw-ui-kit/core';
import {LocalizeIfPipe, LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {
  NdwuComboboxDirective,
  NdwuComboboxInputDirective,
  NdwuComboboxPopoverBridgeDirective,
} from '@ndw-ui-kit/core/aria';
import {NdwuPopoverTriggerDirective} from '@ndw-ui-kit/core/popover';
import {NdwuHelperMessageComponent} from '../helper-message/ndwu-helper-message.component';
import {SelectFieldBase} from '../../classes/select-field-base.directive';
import {type NdwuSelectRenderRow, buildSelectRenderRows} from '../../classes/select-render';

@Component({
  selector: 'ndwu-select-field',
  templateUrl: './ndwu-select-field.component.html',
  styleUrl: './ndwu-select-field.component.scss',
  imports: [
    LocalizeIfPipe,
    LocalizePipe,
    NdwuComboboxDirective,
    NdwuComboboxInputDirective,
    NdwuComboboxPopoverBridgeDirective,
    NdwuControlProviderDirective,
    NdwuDropdownPanelComponent,
    NdwuFloatingLabelComponent,
    NdwuFormFieldComponent,
    NdwuHelperMessageComponent,
    NdwuHintDirective,
    NdwuIconButtonComponent,
    NdwuIconComponent,
    NdwuPanelHeaderDirective,
    NdwuPopoverTriggerDirective,
    NdwuResizeObserverDirective,
    NdwuStyledGroupHeaderComponent,
    NdwuStyledListboxComponent,
    NdwuStyledOptionComponent,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuSelectFieldComponent<T = NdwuOption> extends SelectFieldBase<string | number> implements NdwuControl {
  protected readonly ICON_NAME = NDWU_ICON_NAME;
  protected readonly diOptionConfig = inject(NDWU_OPTION_CONFIG, {optional: true}) ?? null;

  protected readonly triggerResize = viewChild.required(NdwuResizeObserverDirective);
  protected readonly triggerWidth = computed(() => this.triggerResize().width());

  public readonly label = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly hint = input<string>('');
  public readonly required = input(false, {transform: booleanAttribute});
  public readonly options = input<readonly T[]>([]);
  public readonly optionAdapter = input<NdwuOptionAdapter<T> | undefined>(undefined);
  public readonly closeButtonAriaLabel = input<string>('Close');

  // == NdwuControl ===========================================================
  public get empty(): boolean {
    return !this.inputValue;
  }

  protected readonly dropdownSize = computed(() => {
    return this.isMobileViewport() ? NDWU_SIZE.XL : this.sizeSvc.effectiveSize();
  });

  // == Component-specific ====================================================
  protected readonly normalizedOptions = computed<NdwuOption[]>(() => {
    return ndwuNormalizeOptions(
      this.options(),
      ndwuResolveOptionsAdapter(this.optionAdapter(), this.diOptionConfig),
    );
  });

  protected readonly renderRows = computed<NdwuSelectRenderRow[]>(() => {
    return buildSelectRenderRows(this.normalizedOptions(), this.groups());
  });

  protected get displayText(): string {
    if (this.empty) {
      return this.placeholder();
    }

    const value = this.inputValue;
    const option = this.normalizedOptions().find((o) => o.value === value);

    return option?.label ?? String(value);
  }

  constructor(
    protected override ngControl: NgControl,
  ) {
    super('', ngControl, 'ndwu-select-trigger-');
  }

  protected onSelectionChange(values: unknown[]): void {
    if (values.length > 0) {
      this.handleChange(values[0] as string | number);
      this.combobox()?.close();
    }
  }
}

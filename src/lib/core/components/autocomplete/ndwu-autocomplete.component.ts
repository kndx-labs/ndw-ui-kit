import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  type TemplateRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {BreakpointObserver} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {
  NdwuComboboxDirective,
  NdwuComboboxInputDirective,
  NdwuComboboxPopoverBridgeDirective,
} from '@ndw-ui-kit/core/aria';
import {NdwuLocalizeIfPipe, NdwuLocalizePipe, NdwuTranslationService} from '@ndw-ui-kit/core/l10n';
import {NdwuPopoverTriggerDirective, ndwuCreateDropdownController} from '@ndw-ui-kit/core/popover';
import {
  HANDSET_BREAKPOINT,
  type OptionRow,
  buildOptionRows,
  optionGroupHeaderId,
  optionRowKey,
  uniqueId,
} from '@ndw-ui-kit/core/utils';
import {NdwuResizeObserverDirective, NdwuSizeDirective} from '../../directives';
import {NDWU_ICON_NAME} from '../../../icon-names';
import {NDWU_SIZE, type NdwuOptionGroup} from '../../../shared.types';
import {NdwuIconButtonComponent} from '../button/icon/ndwu-icon-button.component';
import {NDWU_CONTROL, type NdwuControl} from '../form-field/control/ndwu-control';
import {NdwuFormFieldComponent} from '../form-field/ndwu-form-field.component';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {NDWU_INTERACTION_FOCUS_TYPE, NdwuInteractionRegistry} from '../interaction';
import {NdwuDropdownPanelComponent, NdwuPanelFooterDirective, NdwuPanelHeaderDirective} from '../styled-dropdown';
import {NdwuStyledGroupHeaderComponent, NdwuStyledListboxComponent, NdwuStyledOptionComponent} from '../styled-listbox';
import type {NdwuAutocompleteFilter, NdwuAutocompleteOption} from './ndwu-autocomplete.types';
import {ndwuAutocompleteContainsFilter} from './ndwu-autocomplete.utils';

@Component({
  selector: 'ndwu-autocomplete',
  templateUrl: './ndwu-autocomplete.component.html',
  styleUrl: './ndwu-autocomplete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    NdwuLocalizeIfPipe,
    NdwuLocalizePipe,
    NdwuComboboxDirective,
    NdwuComboboxInputDirective,
    NdwuComboboxPopoverBridgeDirective,
    NdwuDropdownPanelComponent,
    NdwuFormFieldComponent,
    NdwuIconButtonComponent,
    NdwuIconComponent,
    NdwuPanelFooterDirective,
    NdwuPanelHeaderDirective,
    NdwuPopoverTriggerDirective,
    NdwuResizeObserverDirective,
    NdwuStyledGroupHeaderComponent,
    NdwuStyledListboxComponent,
    NdwuStyledOptionComponent,
  ],
  providers: [{
    provide: NDWU_CONTROL,
    useExisting: forwardRef(() => NdwuAutocompleteComponent),
  }],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
  host: {
    class: 'ndwu-autocomplete',
  },
})
export class NdwuAutocompleteComponent implements NdwuControl {
  protected readonly ICON_NAME = NDWU_ICON_NAME;
  protected readonly SIZE = NDWU_SIZE;

  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly registry = inject(NdwuInteractionRegistry);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly injector = inject(Injector);
  protected readonly translation = inject(NdwuTranslationService);
  protected readonly breakpoint = inject(BreakpointObserver);
  protected readonly dropdownControllerFactory = ndwuCreateDropdownController;

  public readonly value = input<string>('');
  public readonly options = input<readonly NdwuAutocompleteOption[]>([]);
  public readonly groups = input<readonly NdwuOptionGroup[]>([]);
  public readonly filter = input<NdwuAutocompleteFilter | null>(ndwuAutocompleteContainsFilter);
  public readonly placeholder = input<string>('');
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly idInput = input<string>('', {alias: 'id'});
  public readonly ariaLabel = input<string>('');
  public readonly ariaLabelledby = input<string | null>(null);
  public readonly ariaDescribedby = input<string | null>(null);
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly disabledInput = input(false, {alias: 'disabled', transform: booleanAttribute});
  public readonly readonly = input(false, {transform: booleanAttribute});
  public readonly required = input(false, {transform: booleanAttribute});
  public readonly invalid = input(false, {transform: booleanAttribute});
  public readonly localizeLabels = input(true, {transform: booleanAttribute});
  public readonly sheetTitle = input<string>('');
  public readonly clearButtonAriaLabel = input<string>('Clear');
  public readonly closeButtonAriaLabel = input<string>('Close');
  public readonly footer = input<TemplateRef<unknown> | null>(null);

  public readonly valueChange = output<string>();
  public readonly optionSelected = output<NdwuAutocompleteOption>();
  public readonly blurred = output<void>();

  public readonly focused = signal<boolean>(false);
  public readonly currentValue = linkedSignal(() => this.value());
  public readonly hasRightIcon = true;

  protected readonly openRequested = signal<boolean>(false);

  protected readonly generatedId = uniqueId('ndwu-autocomplete-');

  protected readonly combobox = viewChild.required(NdwuComboboxDirective);
  protected readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');
  protected readonly triggerResize = viewChild.required(NdwuResizeObserverDirective);

  protected readonly isMobileViewport = toSignal(
    this.breakpoint
      .observe(HANDSET_BREAKPOINT)
      .pipe(map((result) => result.matches)),
    {initialValue: this.breakpoint.isMatched(HANDSET_BREAKPOINT)},
  );

  protected readonly langChange = toSignal(this.translation.onLangChange$);

  protected readonly triggerWidth = computed(() => this.triggerResize().width());

  protected readonly dropdownSize = computed(() => {
    return this.isMobileViewport() ? NDWU_SIZE.XL : this.sizeSvc.effectiveSize();
  });

  protected readonly query = computed(() => this.currentValue().trim());

  protected readonly displayOptions = computed<readonly NdwuAutocompleteOption[]>(() => {
    this.langChange();

    return this.options().map((option) => ({...option, label: this.displayLabel(option.label)}));
  });

  protected readonly rows = computed<OptionRow<NdwuAutocompleteOption>[]>(() => {
    const query = this.query();

    if (!query) {
      return [];
    }

    const filter = this.filter();
    const options = this.displayOptions();
    const filtered = filter ? options.filter((option) => filter(option, query)) : options;

    return buildOptionRows(filtered, this.groups());
  });

  protected readonly canShowPanel = computed(() => {
    if (this.readonly() || this.disabled) {
      return false;
    }

    if (this.isMobileViewport()) {
      return true;
    }

    return !!this.query() && (this.rows().length > 0 || !!this.footer());
  });

  protected readonly rowKey = optionRowKey;

  protected readonly showClear = computed(() => {
    return !!this.currentValue() && !this.disabled && !this.readonly();
  });

  protected readonly panelClass = computed(() => {
    const base = ['ndwu-options-panel'];

    return this.isMobileViewport() ? [...base, 'ndwu-options-panel--sheet'] : base;
  });

  public get id(): string {
    return this.idInput() || this.generatedId;
  }

  public get empty(): boolean {
    return !this.currentValue();
  }

  public get disabled(): boolean {
    return this.disabledInput();
  }

  public get hasPlaceholder(): boolean {
    return !!this.placeholder();
  }

  constructor() {
    effect(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.INPUT, this.id, this.focused());
    });

    let wasExpanded = false;

    effect(() => {
      const expanded = this.combobox().expanded();

      untracked(() => {
        this.registry.setOverlayOpen(this.id, expanded);

        if (wasExpanded && !expanded) {
          this.blurred.emit();
        }
      });

      wasExpanded = expanded;
    });

    effect(() => {
      const combobox = this.combobox();

      if (!this.canShowPanel()) {
        if (combobox.expanded()) {
          untracked(() => combobox.close({focusOrigin: false}));
        }

        return;
      }

      if (this.openRequested()) {
        untracked(() => {
          this.openRequested.set(false);
          afterNextRender(() => combobox.open('input'), {injector: this.injector});
        });
      }
    });

    this.destroyRef.onDestroy(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.INPUT, this.id, false);
      this.registry.setOverlayOpen(this.id, false);
    });
  }

  public focus(): void {
    this.inputRef().nativeElement.focus();
  }

  public open(): void {
    this.combobox().open('mouse');
  }

  public close(): void {
    this.combobox().close();
  }

  protected onInput(value: string): void {
    this.updateValue(value);
    this.combobox()
      .listbox()
      ?.clearActiveItem();
    this.openRequested.set(true);
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.openRequested.set(false);

    if (!this.combobox().expanded()) {
      this.blurred.emit();
    }
  }

  protected clear(target: HTMLInputElement): void {
    this.updateValue('');
    target.focus();
  }

  protected onPick(values: unknown[]): void {
    const value = values[0];
    const option = this.options().find((item) => item.value === value);

    if (!option) {
      return;
    }

    this.updateValue(this.displayLabel(option.label));
    this.optionSelected.emit(option);
    this.combobox().close();
  }

  protected groupHeaderId(groupId: string): string {
    return optionGroupHeaderId(this.id, groupId);
  }

  private updateValue(value: string): void {
    this.currentValue.set(value);
    this.valueChange.emit(value);
  }

  private displayLabel(key: string): string {
    return this.localizeLabels() && key ? this.translation.instant(key) : key;
  }
}

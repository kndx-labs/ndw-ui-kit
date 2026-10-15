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
  contentChild,
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
import {NdwuLocalizePipe, NdwuTranslationService} from '@ndw-ui-kit/core/l10n';
import {NdwuPopoverTriggerDirective, ndwuCreateDropdownController} from '@ndw-ui-kit/core/popover';
import {HANDSET_BREAKPOINT, uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuResizeObserverDirective, NdwuSizeDirective} from '../../directives';
import {NDWU_ICON_NAME} from '../../../icon-names';
import {NDWU_SIZE, type NdwuOptionGroup} from '../../../shared.types';
import {NdwuIconButtonComponent} from '../button/icon/ndwu-icon-button.component';
import {NDWU_CONTROL, type NdwuControl} from '../form-field/control/ndwu-control';
import {NdwuIconComponent} from '../icon/ndwu-icon.component';
import {NDWU_INTERACTION_FOCUS_TYPE, NdwuInteractionRegistry} from '../interaction';
import {NdwuDropdownPanelComponent, NdwuPanelFooterDirective, NdwuPanelHeaderDirective} from '../styled-dropdown';
import {NdwuStyledGroupHeaderComponent, NdwuStyledListboxComponent, NdwuStyledOptionComponent} from '../styled-listbox';
import {NdwuAutocompleteFooterDirective} from './ndwu-autocomplete-footer.directive';
import type {NdwuAutocompleteFilter, NdwuAutocompleteOption, NdwuAutocompleteRow} from './ndwu-autocomplete.types';
import {buildAutocompleteRows, ndwuAutocompleteContainsFilter} from './ndwu-autocomplete.utils';

@Component({
  selector: 'ndwu-autocomplete',
  templateUrl: './ndwu-autocomplete.component.html',
  styleUrl: './ndwu-autocomplete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    NdwuLocalizePipe,
    NdwuComboboxDirective,
    NdwuComboboxInputDirective,
    NdwuComboboxPopoverBridgeDirective,
    NdwuDropdownPanelComponent,
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

  protected readonly openRequested = signal<boolean>(false);

  protected readonly generatedId = uniqueId('ndwu-autocomplete-');

  protected readonly combobox = viewChild.required(NdwuComboboxDirective);
  protected readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');
  protected readonly triggerResize = viewChild.required(NdwuResizeObserverDirective);
  protected readonly footerDirective = contentChild(NdwuAutocompleteFooterDirective);

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

    const options = this.options();

    if (!this.localizeLabels()) {
      return options;
    }

    return options.map((option) => ({...option, label: this.translate(option.label)}));
  });

  protected readonly displayGroups = computed<readonly NdwuOptionGroup[]>(() => {
    this.langChange();

    const groups = this.groups();

    if (!this.localizeLabels()) {
      return groups;
    }

    return groups.map((group) => ({...group, label: this.translate(group.label)}));
  });

  protected readonly rows = computed<NdwuAutocompleteRow[]>(() => {
    const query = this.query();

    if (!query) {
      return [];
    }

    const filter = this.filter();
    const options = this.displayOptions();
    const filtered = filter ? options.filter((option) => filter(option, query)) : options;

    return buildAutocompleteRows(filtered, this.displayGroups());
  });

  protected readonly resolvedFooter = computed(() => {
    return this.footer() ?? this.footerDirective()?.templateRef ?? null;
  });

  protected readonly canShowPanel = computed(() => {
    if (this.readonly() || this.disabled) {
      return false;
    }

    if (this.isMobileViewport()) {
      return true;
    }

    return !!this.query() && (this.rows().length > 0 || !!this.resolvedFooter());
  });

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

  public readonly hasRightIcon = true;

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
      if (!this.openRequested() || !this.canShowPanel()) {
        return;
      }

      untracked(() => {
        this.openRequested.set(false);
        afterNextRender(() => this.combobox().open('input'), {injector: this.injector});
      });
    });

    effect(() => {
      const combobox = this.combobox();

      if (combobox.expanded() && !this.canShowPanel()) {
        untracked(() => combobox.close({focusOrigin: false}));
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

  public setValue(value: string): void {
    this.currentValue.set(value);
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    const listbox = this.combobox().listbox();

    this.updateValue(target.value);
    listbox?.clearActiveItem();
    this.openRequested.set(true);
  }

  protected onFocus(): void {
    this.focused.set(true);
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

    this.updateValue(this.localizeLabels() ? this.translate(option.label) : option.label);
    this.optionSelected.emit(option);
    this.combobox().close();
  }

  protected rowKey(row: NdwuAutocompleteRow): string {
    return row.kind === 'option' ? `opt:${row.option.value}` : `grp:${row.id}`;
  }

  protected groupHeaderId(groupId: string): string {
    return `${this.id}-grp-${groupId.replace(/[^A-Za-z0-9_-]/g, '-')}`;
  }

  private updateValue(value: string): void {
    this.currentValue.set(value);
    this.valueChange.emit(value);
  }

  private translate(key: string): string {
    return key ? this.translation.instant(key) : key;
  }
}

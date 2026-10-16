import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  NdwuAutocompleteComponent,
  type NdwuAutocompleteFilter,
  NdwuAutocompleteFooterDirective,
  type NdwuAutocompleteOption,
  NdwuFloatingLabelComponent,
  NdwuFormFieldComponent,
  type NdwuHelperMessageStatus,
  NdwuHintDirective,
  type NdwuOptionGroup,
  NdwuSizeDirective,
  ndwuAutocompleteContainsFilter,
} from '@ndw-ui-kit/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuFormFieldBase} from '../../classes/form-field-base';
import {NdwuHelperMessageComponent} from '../helper-message/ndwu-helper-message.component';

@Component({
  selector: 'ndwu-autocomplete-field',
  templateUrl: './ndwu-autocomplete-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuAutocompleteComponent,
    NdwuFloatingLabelComponent,
    NdwuFormFieldComponent,
    NdwuHelperMessageComponent,
    NdwuHintDirective,
  ],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuAutocompleteFieldComponent extends NdwuFormFieldBase<string> implements OnInit {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  public readonly label = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly hint = input<string>('');
  public readonly ariaLabel = input<string>('');
  public readonly ndwuRequired = input(false, {transform: booleanAttribute});
  public readonly readonly = input(false, {transform: booleanAttribute});
  public readonly options = input<readonly NdwuAutocompleteOption[]>([]);
  public readonly groups = input<readonly NdwuOptionGroup[]>([]);
  public readonly filter = input<NdwuAutocompleteFilter | null>(ndwuAutocompleteContainsFilter);
  public readonly localizeLabels = input(true, {transform: booleanAttribute});
  public readonly clearButtonAriaLabel = input<string>('Clear');
  public readonly closeButtonAriaLabel = input<string>('Close');

  public readonly optionSelected = output<NdwuAutocompleteOption>();

  protected readonly hintId = `${uniqueId('ndwu-autocomplete-field-')}-hint`;

  protected readonly footerDirective = contentChild(NdwuAutocompleteFooterDirective);
  protected readonly autocomplete = viewChild(NdwuAutocompleteComponent);

  protected readonly hasHelperMessage = computed(() => {
    return !!this.errorMessage() || !!this.hint();
  });

  protected readonly hintStatus = computed((): NdwuHelperMessageStatus => {
    return this.errorMessage() ? 'error' : 'default';
  });

  constructor() {
    super('');
  }

  public ngOnInit(): void {
    this.initValidationState();
  }

  public override writeValue(value: string | null): void {
    super.writeValue(value ?? '');
  }

  public onBlur(): void {
    this.onTouched();
  }

  public onValueChange(value: string): void {
    this.handleChange(value);
  }

  public setFocus(): void {
    this.autocomplete()?.focus();
  }
}

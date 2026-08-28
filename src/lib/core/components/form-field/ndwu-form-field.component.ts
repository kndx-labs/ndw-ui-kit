import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  signal,
} from '@angular/core';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NdwuSizeDirective} from '../../directives';
import {NDWU_CONTROL} from './control';
import {NdwuFloatingLabelComponent, NdwuHintDirective, NdwuRightIconDirective, NdwuSuffixDirective} from './frame';

@Component({
  selector: 'ndwu-form-field',
  templateUrl: './ndwu-form-field.component.html',
  styleUrl: './ndwu-form-field.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [],
  hostDirectives: [{
    directive: NdwuSizeDirective,
    inputs: ['ndwuSize: size'],
  }],
})
export class NdwuFormFieldComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);

  /** Stable id placed on the <label> element so controls can reference it via aria-labelledby. */
  public readonly labelId = signal<string>(uniqueId('ndwu-label-'));

  public readonly control = contentChild(NDWU_CONTROL, {descendants: true});
  public readonly readonly = input(false, {transform: booleanAttribute});

  protected readonly labels = contentChildren(NdwuFloatingLabelComponent, {descendants: true});
  protected readonly hints = contentChildren(NdwuHintDirective, {descendants: true});
  protected readonly suffixes = contentChildren(NdwuSuffixDirective, {descendants: true});
  protected readonly rightIcons = contentChildren(NdwuRightIconDirective, {descendants: true});

  protected readonly hasLabel = computed(() => this.labels().length > 0);
  protected readonly hasHint = computed(() => this.hints().length > 0);
  protected readonly hasSuffix = computed(() => this.suffixes().length > 0);
  protected readonly hasRightIcon = computed(() => this.rightIcons().length > 0);

  protected get inputId(): string | null {
    return this.control()?.id ?? null;
  }

  protected get isFieldDisabled(): boolean {
    return this.control()?.disabled ?? false;
  }

  protected get isLabelFloating(): boolean {
    const control = this.control();

    if (!control) {
      return false;
    }

    if (control.shouldLabelFloat) {
      return control.shouldLabelFloat;
    }

    return control.focused() || !control.empty || (control.hasPlaceholder ?? false);
  }

  protected get rootClass(): string {
    return `ndwu-form-field ndwu-form-field--${this.sizeSvc.effectiveSize()}`;
  }

  protected get labelClass(): string {
    const floating = this.isLabelFloating ? 'ndwu-form-field__label--floating' : '';
    const disabled = this.isFieldDisabled ? 'ndwu-form-field__label--disabled' : '';

    return `ndwu-form-field__label ${floating} ${disabled}`.trim();
  }
}

import {
  DestroyRef,
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  OnInit,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {isObservable} from 'rxjs';
import {uniqueId} from '@ndw-ui-kit/core/utils';
import {NDWU_CONTROL, type NdwuControl} from '../ndwu-control';
import {NDWU_INTERACTION_FOCUS_TYPE, NdwuInteractionRegistry} from '../../../interaction';

@Directive({
  selector: 'input[ndwu-input],input[ndwuInput]',
  standalone: true,
  providers: [{
    provide: NDWU_CONTROL,
    useExisting: forwardRef(() => NdwuInputDirective),
  }],
})
export class NdwuInputDirective implements OnInit, NdwuControl {
  protected readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  protected readonly ngControl = inject(NgControl, {optional: true});
  protected readonly parentNgControl = inject(NgControl, {optional: true, skipSelf: true});
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly registry = inject(NdwuInteractionRegistry);

  protected readonly generatedId = uniqueId('ndwu-input-');
  protected readonly idSignal = signal<string>(this.el.nativeElement.id || this.generatedId);

  public readonly focused = signal<boolean>(false);

  protected readonly syncFocusedWithRegistry = effect(() => {
    this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.INPUT, this.id, this.focused());
  });

  protected readonly hasValue = signal<boolean>(false);

  /**
   * Browsers (Chrome/Edge) expose autofilled value via `:autofill` only, `el.value` stays empty
   * and no `input` event fires until user interacts with the page.
   * Detected via `animationstart` on empty keyframes (see `ndwu-form-field.component.scss`).
   */
  protected readonly isAutofilled = signal<boolean>(false);

  protected readonly ariaInvalid = signal<boolean>(false);
  protected readonly nativeInvalid = signal<boolean>(false);
  protected readonly nativeDisabled = signal<boolean>(false);

  public readonly readonly = input(false, {transform: booleanAttribute});

  protected readonly controlDisabled = signal<boolean>(false);
  protected readonly controlInteracted = signal<boolean>(false);
  protected readonly errorState = signal<boolean>(false);

  protected readonly hasAngularControl = computed(() => {
    return !!this.getAngularControl();
  });

  protected readonly effectiveDisabled = computed(() => {
    return this.hasAngularControl() ? this.controlDisabled() : this.nativeDisabled();
  });

  public get empty(): boolean {
    return !this.hasValue() && !this.isAutofilled();
  }

  public get disabled(): boolean {
    return this.effectiveDisabled();
  }

  public get id(): string {
    return this.idSignal();
  }

  protected readonly effectiveInvalid = computed(() => {
    if (this.hasAngularControl()) {
      return this.errorState();
    }

    return this.nativeInvalid() || this.ariaInvalid();
  });

  @HostBinding('attr.id')
  protected get idAttr(): string {
    return this.idSignal();
  }

  @HostBinding('class.ndwu-form-field__input')
  protected readonly baseClass = true;

  @HostBinding('class.ndwu-form-field__input--invalid')
  protected get invalidClass(): boolean {
    return this.effectiveInvalid();
  }

  @HostBinding('attr.aria-invalid')
  protected get ariaInvalidAttr(): 'true' | null {
    // For Angular forms, ensure `aria-invalid` reflects the effective invalid state.
    // For non-forms, consumers can set `aria-invalid` themselves (we observe it).
    if (!this.hasAngularControl()) {
      return null;
    }

    return this.effectiveInvalid() ? 'true' : null;
  }

  @HostBinding('attr.readonly')
  protected get hostReadonly(): boolean | null {
    return this.readonly() || null;
  }

  public ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      this.registry.setFocused(NDWU_INTERACTION_FOCUS_TYPE.INPUT, this.id, false);
    });

    this.syncFromNative();

    const control = this.getAngularControl();

    if (control) {
      this.syncWithNgControl();

      control.statusChanges
        .pipe(
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          this.syncWithNgControl();
          this.syncFromNativeValidity();
        });

      control.valueChanges
        .pipe(
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          this.syncFromControlValue(); // covers programmatic writes to the control (reactive + template-driven).
          this.syncWithNgControl();
          this.syncFromNativeValidity();
        });

      // `events` fires for value/status/pristine/touched changes;
      // (it's typed as `any` in the public API docs)
      const events = (control as unknown as {events?: unknown}).events;

      if (isObservable(events)) {
        events
          .pipe(
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe(() => {
            this.syncWithNgControl();
          });
      }
    } else {
      // non-forms inputs: keep state in sync with native attributes when they change.
      this.installAttributeObserver();
    }
  }

  @HostListener('focus')
  protected onFocus(): void {
    this.focused.set(true);
  }

  @HostListener('blur')
  protected onBlur(): void {
    this.focused.set(false);
  }

  @HostListener('animationstart', ['$event'])
  protected onAnimationStart(event: AnimationEvent): void {
    if (event.animationName === 'ndwu-autofill-start') {
      this.isAutofilled.set(true);
    } else if (event.animationName === 'ndwu-autofill-end') {
      this.isAutofilled.set(false);
    }
  }

  @HostListener('input')
  protected onInput(): void {
    // keeps floating label in sync for both forms and non-forms.
    this.syncFromNativeValue();
    this.syncFromNativeValidity();
  }

  public isDisabled(): boolean {
    return this.effectiveDisabled();
  }

  protected syncWithNgControl(): void {
    const control = this.getAngularControl();

    if (!control) {
      this.controlDisabled.set(false);
      this.controlInteracted.set(false);
      this.errorState.set(false);

      return;
    }

    const invalid = control.invalid ?? false;
    const disabled = control.disabled ?? false;
    const touched = control.touched ?? false;
    const dirty = control.dirty ?? false;
    const interacted = touched || dirty;

    this.controlDisabled.set(disabled);
    this.controlInteracted.set(interacted);
    this.errorState.set(invalid && interacted);
  }

  protected syncFromControlValue(): void {
    const control = this.getAngularControl();

    if (!control) {
      return;
    }

    this.hasValue.set(String(control.value ?? '').length > 0);
  }

  protected syncFromNative(): void {
    this.idSignal.set(this.el.nativeElement.id || this.generatedId);
    this.syncFromNativeValue();
    this.nativeDisabled.set(this.el.nativeElement.disabled);
    this.syncFromNativeAriaInvalid();
    this.syncFromNativeValidity();
  }

  protected syncFromNativeValue(): void {
    this.hasValue.set(this.el.nativeElement.value.length > 0);
  }

  protected syncFromNativeAriaInvalid(): void {
    const attr = this.el.nativeElement.getAttribute('aria-invalid');

    this.ariaInvalid.set(attr === 'true');
  }

  protected syncFromNativeValidity(): void {
    const el = this.el.nativeElement;

    if (typeof el.matches !== 'function') {
      this.nativeInvalid.set(false);

      return;
    }

    // Uses native constraint validation (e.g. required/pattern/minlength).
    this.nativeInvalid.set(el.matches(':invalid'));
  }

  protected installAttributeObserver(): void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'attributes') {
          continue;
        }

        switch (mutation.attributeName) {
          case 'id':
            this.idSignal.set(this.el.nativeElement.id || this.generatedId);
            break;
          case 'disabled':
            this.nativeDisabled.set(this.el.nativeElement.disabled);
            break;
          case 'value':
            // If a consumer updates `[attr.value]` / sets the value attribute, keep floating label in sync.
            this.syncFromNativeValue();
            this.syncFromNativeValidity();
            break;
          case 'aria-invalid':
            this.syncFromNativeAriaInvalid();
            break;
          default:
            break;
        }
      }
    });

    observer.observe(
      this.el.nativeElement,
      {
        attributes: true,
        attributeFilter: ['id', 'disabled', 'value', 'aria-invalid'],
      },
    );

    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  protected getAngularControl(): NgControl['control'] | null {
    return this.ngControl?.control ?? this.parentNgControl?.control ?? null;
  }
}

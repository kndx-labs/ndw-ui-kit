import {ChangeDetectionStrategy, Component, Signal, ViewContainerRef, computed, inject, viewChild} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {CdkPortalOutlet, ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {CdkTrapFocus} from '@angular/cdk/a11y';
import {BreakpointObserver} from '@angular/cdk/layout';
import {map} from 'rxjs';
import {HANDSET_BREAKPOINT} from '@ndw-ui-kit/core/utils';
import {NDWU_POPOVER_CONTENT, NDWU_POPOVER_CONTEXT, NDWU_POPOVER_TRAP_FOCUS} from './ndwu-popover.tokens';

/**
 * Wrapper component that renders inside the CDK overlay. Receives content and context via DI,
 * renders content using CdkPortalOutlet (component or template) or string interpolation.
 * When trapFocus is true, focus is trapped inside the panel for keyboard accessibility.
 */
@Component({
  selector: 'ndwu-popover-host',
  templateUrl: './ndwu-popover-host.component.html',
  styleUrl: './ndwu-popover-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkTrapFocus,
    CdkPortalOutlet,
  ],
  host: {
    '[class.ndwu-popover-host--mobile]': 'isMobile()',
  },
})
export class NdwuPopoverHostComponent {
  protected readonly portalOutlet = viewChild.required(CdkPortalOutlet);

  protected readonly content = inject(NDWU_POPOVER_CONTENT);

  private readonly contextSignal = inject(NDWU_POPOVER_CONTEXT, {optional: true});

  /** When true, focus is trapped in the panel; when false (e.g. autocomplete), focus stays on trigger. */
  protected readonly trapFocus = inject(NDWU_POPOVER_TRAP_FOCUS, {optional: true}) ?? false;

  /** Unwrap context signal for reactivity; fallback to empty object. */
  protected readonly context = computed(() => this.contextSignal?.() ?? {});

  /** ViewContainerRef for creating TemplatePortal with correct injector. */
  public readonly viewContainerRef = inject(ViewContainerRef);

  /** Whether content is a plain string (rendered via template instead of portal outlet). */
  protected get isStringContent(): boolean {
    return typeof this.content === 'string';
  }

  public attachComponentPortal<T>(portal: ComponentPortal<T>): void {
    this.portalOutlet().attachComponentPortal(portal);
  }

  public attachTemplatePortal<T>(portal: TemplatePortal<T>): void {
    this.portalOutlet().attachTemplatePortal(portal);
  }

  protected readonly isMobile: Signal<boolean>;

  protected readonly breakpointObserver = inject(BreakpointObserver);

  constructor() {
    this.isMobile = toSignal(
      this.breakpointObserver.observe(HANDSET_BREAKPOINT).pipe(map((r) => r.matches)),
      {initialValue: false},
    );
  }
}

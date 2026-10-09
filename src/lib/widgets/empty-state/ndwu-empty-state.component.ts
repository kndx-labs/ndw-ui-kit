import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterEveryRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {LocalizeHtmlPipe, type NdwuLocalizableHtml} from '@ndw-ui-kit/core/l10n';
import {NdwuSizeFlags} from '@ndw-ui-kit/core/utils';
import {
  NDWU_SIZE,
  NDWU_SIZE_TOKEN,
  NdwuAdaptivePictogramComponent,
  NdwuAdaptiveSizeDirective,
  NdwuPictogramBaseName,
  NdwuPictogramVariant,
  NdwuSizeDirective,
} from '@ndw-ui-kit/core';

@Component({
  selector: 'ndwu-empty-state',
  imports: [NdwuAdaptivePictogramComponent, LocalizeHtmlPipe],
  templateUrl: './ndwu-empty-state.component.html',
  styleUrl: './ndwu-empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NdwuSizeDirective,
      inputs: ['ndwuSize: size'],
    },
    {
      directive: NdwuAdaptiveSizeDirective,
      inputs: ['ndwuAdaptiveSize: adaptiveSize'],
    },
  ],
  providers: [
    {
      provide: NDWU_SIZE_TOKEN,
      useFactory: () => {
        const component = inject(NdwuEmptyStateComponent);

        return () => component.resolvedSize();
      },
    },
  ],
})
export class NdwuEmptyStateComponent {
  protected readonly sizeSvc = inject(NdwuSizeDirective);
  protected readonly adaptiveSvc = inject(NdwuAdaptiveSizeDirective);

  public readonly resolvedSize = computed(() => {
    return this.adaptiveSvc.adaptiveSize() ?? this.sizeSvc.effectiveSize();
  });

  public readonly pictogram = input.required<NdwuPictogramBaseName>();
  public readonly pictogramVariant = input<NdwuPictogramVariant>('DEFAULT');
  public readonly header = input<NdwuLocalizableHtml>();
  public readonly description = input<NdwuLocalizableHtml>();

  protected readonly pictogramFlags: NdwuSizeFlags = {
    XL: computed(() => this.resolvedSize() === NDWU_SIZE.XL),
    L: computed(() => this.resolvedSize() !== NDWU_SIZE.XL),
  };

  protected readonly actionsContainer = viewChild<ElementRef<HTMLDivElement>>('actionsContainer');
  protected readonly hasActions = signal<boolean>(false);

  protected readonly hostClasses = computed(() => {
    const classList = [
      'ndwu-empty-state',
      `ndwu-empty-state--${this.resolvedSize() === NDWU_SIZE.XL ? 'XL' : 'L'}`,
    ];

    if (this.hasActions()) {
      classList.push('ndwu-empty-state--with-actions');
    }

    return classList;
  });

  constructor() {
    afterEveryRender(() => {
      const actionsContainerEl = this.actionsContainer()?.nativeElement;
      const actionNodesCount = actionsContainerEl?.childNodes?.length ?? 0;

      this.hasActions.set(actionNodesCount > 0);
    });
  }
}

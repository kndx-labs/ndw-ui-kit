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
import {LocalizePipe} from '@ndw-ui-kit/core/l10n';
import {NdwuSizeFlags} from '@ndw-ui-kit/core/utils';
import {NdwuAdaptivePictogramComponent} from '../pictogram/ndwu-adaptive-pictogram.component';
import {NdwuPictogramBaseName} from '../pictogram/ndwu-adaptive-pictogram.helpers';
import {NdwuPictogramVariant} from '../../../pictogram-presets';
import {NdwuAdaptiveSizeDirective, NdwuSizeDirective} from '../../directives';
import {NDWU_SIZE_TOKEN} from '../../tokens';
import {SIZE} from '../../../shared.types';

@Component({
  selector: 'ndwu-empty-state',
  imports: [NdwuAdaptivePictogramComponent, LocalizePipe],
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
  public readonly header = input<string>();
  public readonly description = input<string>();

  protected readonly pictogramFlags: NdwuSizeFlags = {
    XL: computed(() => this.resolvedSize() === SIZE.XL),
    L: computed(() => this.resolvedSize() !== SIZE.XL),
  };

  protected readonly actionsContainer = viewChild<ElementRef<HTMLDivElement>>('actionsContainer');
  protected readonly hasActions = signal<boolean>(false);

  protected readonly hostClasses = computed(() => {
    const classList = [
      'ndwu-empty-state',
      `ndwu-empty-state--${this.resolvedSize() === SIZE.XL ? 'XL' : 'L'}`,
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

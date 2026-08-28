import {ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input} from '@angular/core';
import {NDWU_ICON_SPRITE_CONFIG} from '../../tokens';
import {ensureAvailableIconName, extractDimsClass, iconNameTransform} from './ndwu-icon.helpers';

@Component({
  selector: 'ndwu-icon',
  templateUrl: './ndwu-icon.component.html',
  styleUrl: './ndwu-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class NdwuIconComponent {
  private readonly iconSpriteConfig = inject(NDWU_ICON_SPRITE_CONFIG);

  public readonly name = input.required({transform: iconNameTransform});
  public readonly stretched = input(false, {transform: booleanAttribute});

  protected readonly effectiveName = computed(() => {
    const config = this.iconSpriteConfig;
    const availableIconNames = config.sources.flatMap((source) => source.iconNames);

    return ensureAvailableIconName(
      this.name(),
      availableIconNames,
      config.fallbackIconName,
    );
  });

  protected readonly spriteRef = computed(() => {
    const config = this.iconSpriteConfig;
    const iconName = this.effectiveName();
    const source = config.sources.find((entry) => entry.iconNames.includes(iconName));

    return `${source?.path ?? config.sources[0]?.path ?? 'assets/ndw-ui-kit.sprite.svg'}#${iconName}`;
  });

  protected readonly rootClass = computed(() => {
    if (this.stretched()) {
      return 'ndwu-icon ndwu-icon--stretch';
    }

    const dimsClass = extractDimsClass(this.effectiveName());

    return dimsClass ? `ndwu-icon ${dimsClass}` : 'ndwu-icon';
  });
}

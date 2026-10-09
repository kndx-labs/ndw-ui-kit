import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {
  NDWU_ICON_NAME,
  NDWU_SIZE,
  NDWU_TAG_STATUS,
  NdwuButtonComponent,
  type NdwuSize,
  NdwuTagComponent,
  type NdwuTagStatus,
} from '@ndw-ui-kit/core';
import {ShowcaseLayoutComponent} from '@app/components';

const FILTER_TAGS = ['Router', 'Switch', 'Access point', 'Extender', 'Repeater'];

@Component({
  selector: 'app-tag-overview',
  templateUrl: './tag-overview.component.html',
  styleUrl: './tag-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NdwuButtonComponent,
    NdwuTagComponent,
    ShowcaseLayoutComponent,
  ],
})
export class TagOverviewComponent {
  protected readonly ICON_NAME = NDWU_ICON_NAME;

  protected readonly statuses: NdwuTagStatus[] = Object.values(NDWU_TAG_STATUS);

  protected readonly sizes: NdwuSize[] = [NDWU_SIZE.L, NDWU_SIZE.XL];

  protected readonly filterTags = signal<string[]>(FILTER_TAGS);

  protected removeFilterTag(tag: string): void {
    this.filterTags.update((tags) => tags.filter((item) => item !== tag));
  }

  protected resetFilterTags(): void {
    this.filterTags.set(FILTER_TAGS);
  }
}

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NdwuBadgeComponent, NdwuCardComponent} from '@ndw-ui-kit/core';
import libPackage from '../../lib/package.json';
import {INTRODUCTION_CARDS, IntroductionCard} from './introduction.cards';

interface IntroductionGroup {
  name: string;
  cards: readonly IntroductionCard[];
}

const groupCards = (cards: readonly IntroductionCard[]): readonly IntroductionGroup[] => {
  const names = [...new Set(cards.map((card) => card.group))];

  return names.map((name) => ({name, cards: cards.filter((card) => card.group === name)}));
};

@Component({
  selector: 'sb-introduction',
  templateUrl: './sb-introduction.component.html',
  styleUrl: './sb-introduction.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NdwuBadgeComponent, NdwuCardComponent],
})
export class SbIntroductionComponent {
  protected readonly version = libPackage.version;
  protected readonly groups = groupCards(INTRODUCTION_CARDS);
}

import {Meta, StoryObj, moduleMetadata} from '@storybook/angular';
import {SbIntroductionComponent} from './sb-introduction.component';

const meta: Meta = {
  title: 'Hidden/Introduction',
  tags: ['!dev'],
  decorators: [moduleMetadata({imports: [SbIntroductionComponent]})],
  render: () => ({template: '<sb-introduction />'}),
};

export default meta;

export const Home: StoryObj = {};

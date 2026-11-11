import {Meta, StoryObj, moduleMetadata} from '@storybook/angular';
import {SbRegistryComponent} from './sb-registry.component';

const meta: Meta = {
  title: 'Hidden/Registry',
  tags: ['!dev'],
  decorators: [moduleMetadata({imports: [SbRegistryComponent]})],
};

export default meta;

export const Icons: StoryObj = {
  render: () => ({template: '<sb-registry kind="icon" />'}),
};

export const Pictograms: StoryObj = {
  render: () => ({template: '<sb-registry kind="pictogram" />'}),
};

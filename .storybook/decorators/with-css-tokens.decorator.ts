import {Decorator} from '@storybook/angular';
import {setRenderedStory} from '../addons/css-tokens/preview';
import {type CssTokensParameters} from '../addons/css-tokens/shared';

export const withCssTokens: Decorator = (storyFn, context) => {
  const parameters = context.parameters as CssTokensParameters;

  setRenderedStory({
    storyId: context.id,
    groups: parameters.cssTokens ?? [],
    args: context.args,
    viewMode: context.viewMode,
  });

  return storyFn();
};

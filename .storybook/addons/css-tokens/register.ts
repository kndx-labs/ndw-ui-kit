import {createElement} from 'react';
import {STORY_PREPARED} from 'storybook/internal/core-events';
import {addons, types} from 'storybook/manager-api';
import {CssTokensPanel} from './panel';
import {
  CSS_TOKENS_ADDON_ID,
  CSS_TOKENS_EVENT,
  CSS_TOKENS_PANEL_ID,
  type CssTokenOverridesByStory,
  type CssTokensParameters,
  EMPTY_OVERRIDES,
} from './shared';

addons.register(CSS_TOKENS_ADDON_ID, (api) => {
  api.on(STORY_PREPARED, ({id}: {id: string}) => {
    const current = api.getAddonState<CssTokenOverridesByStory | undefined>(CSS_TOKENS_ADDON_ID);

    api.emit(CSS_TOKENS_EVENT.SET, {storyId: id, overrides: current?.[id] ?? EMPTY_OVERRIDES});
  });

  addons.add(CSS_TOKENS_PANEL_ID, {
    type: types.PANEL,
    title: 'CSS tokens',
    render: ({active}) => createElement(CssTokensPanel, {active: active ?? false}),
    disabled: (parameters) => {
      const typed = parameters as CssTokensParameters | undefined;

      return !typed?.cssTokens || typed.controls?.disable === true;
    },
  });
});

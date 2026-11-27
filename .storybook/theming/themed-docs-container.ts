import {DocsContainer, type DocsContainerProps} from '@storybook/addon-docs/blocks';
import {type FC, type PropsWithChildren, createElement, useEffect, useState} from 'react';
import {GLOBALS_UPDATED} from 'storybook/internal/core-events';
import type {Globals} from 'storybook/internal/types';
import {storybookTheme} from './storybook-themes';

const primaryStoryGlobals = (context: DocsContainerProps['context']): Globals | undefined => {
  try {
    const {globals}: {globals?: Globals} = context.getStoryContext(context.storyById());

    return globals;
  } catch {
    return undefined;
  }
};

export const ThemedDocsContainer: FC<PropsWithChildren<DocsContainerProps>> = ({context, children}) => {
  const [globals, setGlobals] = useState(() => primaryStoryGlobals(context));

  useEffect(() => {
    const update = (event: {globals: Globals}): void => setGlobals(event.globals);

    context.channel.on(GLOBALS_UPDATED, update);

    return () => context.channel.off(GLOBALS_UPDATED, update);
  }, [context]);

  return createElement(DocsContainer, {context, theme: storybookTheme(globals)}, children);
};

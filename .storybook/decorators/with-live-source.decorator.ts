import {Decorator} from '@storybook/angular';
import {emitTransformCode, useEffect} from 'storybook/preview-api';

interface DocsSourceParameters {
  readonly docs?: {
    readonly source?: {
      readonly code?: string;
      readonly type?: string;
      readonly excludeDecorators?: boolean;
    };
  };
}

export const withLiveSource: Decorator = (storyFn, context) => {
  const story = storyFn();
  const source = (context.parameters as DocsSourceParameters).docs?.source;

  useEffect(() => {
    if (!story.userDefinedTemplate || source?.code || source?.type === 'code') {
      return;
    }

    const template = source?.excludeDecorators ? context.originalStoryFn(context.args, context).template : story.template;

    if (template) {
      void emitTransformCode(template, context);
    }
  });

  return story;
};

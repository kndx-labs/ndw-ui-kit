import {JsonPipe} from '@angular/common';
import {componentWrapperDecorator, moduleMetadata} from '@storybook/angular';

export const withRowLayout = componentWrapperDecorator((story) => `<div class="sb-row">${story}</div>`);

export const withStackLayout = componentWrapperDecorator((story) => `<div class="sb-stack">${story}</div>`);

export const withResizableLayout = componentWrapperDecorator(
  (story) => `<div class="sb-resizable" tabindex="0">${story}</div>`,
);

export const withValueOutput = (expression: string) => [
  moduleMetadata({imports: [JsonPipe]}),
  componentWrapperDecorator((story) => `${story}\n<pre>{{ ${expression} | json }}</pre>`),
];

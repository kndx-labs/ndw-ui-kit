import {componentWrapperDecorator} from '@storybook/angular';

export const withRowLayout = componentWrapperDecorator((story) => `<div class="sb-row">${story}</div>`);

export const withStackLayout = componentWrapperDecorator((story) => `<div class="sb-stack">${story}</div>`);

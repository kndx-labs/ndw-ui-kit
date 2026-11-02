import {NDWU_SIZE, NdwuSize} from '@ndw-ui-kit/core';
import {Decorator, Preview, componentWrapperDecorator, moduleMetadata} from '@storybook/angular';
import {SbSizeProviderComponent} from './size-provider.component';

const SIZE_DEFAULT = 'default';
const SIZES: readonly NdwuSize[] = Object.values(NDWU_SIZE);

const isNdwuSize = (value: unknown): value is NdwuSize => {
  return SIZES.some((size) => size === value);
};

export const sizeGlobalType: Preview['globalTypes'] = {
  size: {
    description: 'Size for all components in the story',
    toolbar: {
      title: 'Size',
      icon: 'ruler',
      items: [
        {value: SIZE_DEFAULT, title: 'Size: component default'},
        ...SIZES.map((size) => ({value: size, title: `Size: ${size}`})),
      ],
      dynamicTitle: true,
    },
  },
};

export const sizeInitialGlobal: Preview['initialGlobals'] = {
  size: SIZE_DEFAULT,
};

export const withSizeProviderImport = moduleMetadata({
  imports: [SbSizeProviderComponent],
});

const supportedSizes = (parameter: unknown): readonly NdwuSize[] => {
  return Array.isArray(parameter) ? parameter.filter(isNdwuSize) : SIZES;
};

const withUnsupportedSizeNote = (size: NdwuSize): Decorator => {
  return componentWrapperDecorator((story) =>
    `<p class="sb-note">Size ${size} is not supported by this component; it uses its default size.</p>${story}`
  );
};

export const withSize: Decorator = (storyFn, context) => {
  const size: unknown = context.globals['size'];

  if (!isNdwuSize(size)) {
    return storyFn();
  }

  if (!supportedSizes(context.parameters['sizes']).includes(size)) {
    return withUnsupportedSizeNote(size)(storyFn, context);
  }

  return componentWrapperDecorator(SbSizeProviderComponent, {sbToolbarSize: size})(storyFn, context);
};

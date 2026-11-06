import {Args, Decorator} from '@storybook/angular';
import {useArgs} from 'storybook/preview-api';

type Payload<T> = Parameters<Extract<T, (value: never) => void>>[0];

export const withControlledArgs = <TArgs extends Args, K extends keyof TArgs & string>(
  output: K,
  toArgs: (value: Payload<TArgs[K]>) => Partial<TArgs>,
): Decorator<TArgs> => {
  return (storyFn, {args}) => {
    const [, updateArgs] = useArgs<TArgs>();
    const original = args[output] as ((value: Payload<TArgs[K]>) => void) | undefined;

    return storyFn({
      args: {
        ...args,
        [output]: (value: Payload<TArgs[K]>) => {
          original?.(value);
          updateArgs(toArgs(value));
        },
      },
    });
  };
};

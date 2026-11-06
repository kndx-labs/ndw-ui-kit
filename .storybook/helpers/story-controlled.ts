import {Args, Decorator} from '@storybook/angular';
import {useArgs} from 'storybook/preview-api';

type Payload<T> = Parameters<Extract<T, (value: never) => void>>[0];

type OutputKey<TArgs> =
  & { [P in keyof TArgs]: TArgs[P] extends (value: never) => void ? P : never }[keyof TArgs]
  & string;

export const withControlledArgs = <TArgs extends Args, K extends OutputKey<TArgs>>(
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

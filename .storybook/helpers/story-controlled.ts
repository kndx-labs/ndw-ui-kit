import {Args} from '@storybook/angular';
import {useArgs} from 'storybook/preview-api';

type Payload<T> = Parameters<Extract<T, (value: never) => void>>[0];

export const controlledProps = <TArgs extends Args, K extends keyof TArgs & string>(
  args: TArgs,
  output: K,
  toArgs: (value: Payload<TArgs[K]>) => Partial<TArgs>,
): TArgs => {
  const [, updateArgs] = useArgs<TArgs>();
  const original = args[output] as ((value: Payload<TArgs[K]>) => void) | undefined;

  return {
    ...args,
    [output]: (value: Payload<TArgs[K]>) => {
      original?.(value);
      updateArgs(toArgs(value));
    },
  };
};

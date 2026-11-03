import type {NdwuOption, NdwuOptionAdapter} from './shared.types';
import {NDWU_DEFAULT_OPTION_ADAPTER, ndwuNormalizeOptions} from './options';

describe('ndwuNormalizeOptions option variant', () => {
  it('preserves the default adapter variant', () => {
    const options = ndwuNormalizeOptions(
      [{value: 1, label: 'a', variant: 'danger'}],
      NDWU_DEFAULT_OPTION_ADAPTER,
    );

    expect((options[0] as NdwuOption & {variant?: string}).variant).toBe('danger');
  });

  it('omits variant when the adapter resolves it as undefined', () => {
    const options = ndwuNormalizeOptions(
      [{value: 1, label: 'a'}],
      NDWU_DEFAULT_OPTION_ADAPTER,
    );

    expect('variant' in options[0]!).toBe(false);
  });

  it('supports a function selector for variant', () => {
    interface Item {
      id: number;
      title: string;
      destructive: boolean;
    }

    const adapter: NdwuOptionAdapter<Item> = {
      value: 'id',
      label: 'title',
      variant: (item) => item.destructive ? 'danger' : undefined,
    };
    const options = ndwuNormalizeOptions(
      [
        {id: 1, title: 'danger', destructive: true},
        {id: 2, title: 'default', destructive: false},
      ],
      adapter,
    );

    expect((options[0]! as NdwuOption & {variant?: string}).variant).toBe('danger');
    expect('variant' in options[1]!).toBe(false);
  });
});

import type {NdwuOption, NdwuOptionAdapter} from './shared.types';
import {NDWU_DEFAULT_OPTION_ADAPTER, ndwuMapRawOptionsByValue, ndwuNormalizeOptions} from './options';

describe('ndwuMapRawOptionsByValue', () => {
  it('maps raw options to normalized values by index', () => {
    const rawOptions = [{id: 'first'}, {id: 'second'}];
    const normalizedOptions: NdwuOption[] = [
      {value: 'value-a', label: 'A'},
      {value: 'value-b', label: 'B'},
    ];

    const rawByValue = ndwuMapRawOptionsByValue(rawOptions, normalizedOptions);

    expect(rawByValue.get('value-a')).toBe(rawOptions[0]);
    expect(rawByValue.get('value-b')).toBe(rawOptions[1]);
  });

  it('keeps the last raw option for duplicate normalized values', () => {
    const first = {id: 'first'};
    const last = {id: 'last'};
    const rawByValue = ndwuMapRawOptionsByValue(
      [first, last],
      [
        {value: 'duplicate', label: 'First'},
        {value: 'duplicate', label: 'Last'},
      ],
    );

    expect(rawByValue.get('duplicate')).toBe(last);
  });
});

describe('ndwuNormalizeOptions option variant', () => {
  it('preserves the default adapter variant', () => {
    const options = ndwuNormalizeOptions(
      [{value: 1, label: 'a', variant: 'danger'}],
      NDWU_DEFAULT_OPTION_ADAPTER,
    );
    const option = options.at(0);

    expect(option).toBeDefined();

    if (!option) {
      return;
    }

    expect(option).toMatchObject({variant: 'danger'});
  });

  it('omits variant when the adapter resolves it as undefined', () => {
    const options = ndwuNormalizeOptions(
      [{value: 1, label: 'a'}],
      NDWU_DEFAULT_OPTION_ADAPTER,
    );

    const option = options.at(0);

    expect(option).toBeDefined();

    if (!option) {
      return;
    }

    expect('variant' in option).toBe(false);
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

    const dangerOption = options.at(0);
    const defaultOption = options.at(1);

    expect(dangerOption).toBeDefined();
    expect(defaultOption).toBeDefined();

    if (!dangerOption || !defaultOption) {
      return;
    }

    expect(dangerOption).toMatchObject({variant: 'danger'});
    expect('variant' in defaultOption).toBe(false);
  });
});

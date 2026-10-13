import {Injector} from '@angular/core';
import {describe, expect, it, vi} from 'vitest';
import type {NdwuSortDirection} from './ndwu-sort.directive';
import {NdwuTableDataSource, type NdwuTableDataSourceOptions} from './ndwu-table-data-source';

interface Row {
  id: number;
  value: unknown;
}

function sortRows(rows: Row[], direction: NdwuSortDirection, options: NdwuTableDataSourceOptions<Row> = {}): Row[] {
  const source = new NdwuTableDataSource<Row>({injector: Injector.create({providers: []}), ...options});

  source.data.set(rows);
  source.sort.set({active: 'value', direction});

  return [...source.sorted()];
}

function sortValues(
  values: unknown[],
  direction: NdwuSortDirection,
  options: NdwuTableDataSourceOptions<Row> = {},
): unknown[] {
  return sortRows(values.map((value, id) => ({id, value})), direction, options)
    .map(row => row.value);
}

function sortIds(values: unknown[], direction: NdwuSortDirection): number[] {
  return sortRows(values.map((value, id) => ({id, value})), direction)
    .map(row => row.id);
}

describe('NdwuTableDataSource default sort', () => {
  it('sorts numbers', () => {
    expect(sortValues([10, -2, 3.5, 0], 'asc'))
      .toEqual([-2, 0, 3.5, 10]);
    expect(sortValues([10, -2, 3.5, 0], 'desc'))
      .toEqual([10, 3.5, 0, -2]);
  });

  it('sorts infinities as the smallest and largest numbers', () => {
    expect(sortValues([Infinity, 1, -Infinity, Infinity, 0], 'asc'))
      .toEqual([-Infinity, 0, 1, Infinity, Infinity]);
    expect(sortValues([Infinity, 1, -Infinity, Infinity, 0], 'desc'))
      .toEqual([Infinity, Infinity, 1, 0, -Infinity]);
  });

  it('sorts dates by time, not by their string form', () => {
    const saturday = new Date(2026, 9, 3);
    const monday = new Date(2026, 9, 5);
    const wednesday = new Date(2026, 9, 7);

    expect(sortValues([monday, wednesday, saturday], 'asc'))
      .toEqual([saturday, monday, wednesday]);
    expect(sortValues([monday, wednesday, saturday], 'desc'))
      .toEqual([wednesday, monday, saturday]);
  });

  it('puts null and undefined last in both directions', () => {
    expect(sortValues([2, null, 3, undefined, 1], 'asc'))
      .toEqual([1, 2, 3, null, undefined]);
    expect(sortValues([2, null, 3, undefined, 1], 'desc'))
      .toEqual([3, 2, 1, null, undefined]);
  });

  it('puts NaN and invalid dates last in both directions', () => {
    expect(sortIds([2, Number.NaN, 1], 'asc'))
      .toEqual([2, 0, 1]);
    expect(sortIds([2, Number.NaN, 1], 'desc'))
      .toEqual([0, 2, 1]);
    expect(sortIds([new Date(2026, 9, 5), new Date('invalid'), new Date(2026, 9, 3)], 'asc'))
      .toEqual([2, 0, 1]);
    expect(sortIds([new Date(2026, 9, 5), new Date('invalid'), new Date(2026, 9, 3)], 'desc'))
      .toEqual([0, 2, 1]);
  });

  it('sorts strings with numbers naturally', () => {
    expect(sortValues(['item10', 'item2', 'item1'], 'asc'))
      .toEqual(['item1', 'item2', 'item10']);
    expect(sortValues(['item10', 'item2', 'item1'], 'desc'))
      .toEqual(['item10', 'item2', 'item1']);
  });

  it('sorts numbers and numeric strings together by value', () => {
    expect(sortValues(['10', 9, '8'], 'asc'))
      .toEqual(['8', 9, '10']);
  });

  it('keeps the input order of equal keys in both directions', () => {
    expect(sortIds(['b', 'a', 'b', 'a'], 'asc'))
      .toEqual([1, 3, 0, 2]);
    expect(sortIds(['b', 'a', 'b', 'a'], 'desc'))
      .toEqual([0, 2, 1, 3]);
  });
});

describe('NdwuTableDataSource sortComparator', () => {
  const byLength = (a: unknown, b: unknown): number => String(a).length - String(b).length;
  const isEmpty = (value: unknown): boolean => value === null || value === undefined;

  it('orders rows with the custom comparator and applies the direction', () => {
    expect(sortValues(['b', 'ccc', 'aa'], 'asc', {sortComparator: byLength}))
      .toEqual(['b', 'aa', 'ccc']);
    expect(sortValues(['b', 'ccc', 'aa'], 'desc', {sortComparator: byLength}))
      .toEqual(['ccc', 'aa', 'b']);
  });

  it('passes accessor values and the active column to the comparator', () => {
    const sortComparator = vi.fn((a: unknown, b: unknown) => Number(a) - Number(b));
    const rows: Row[] = [{id: 0, value: {size: 2}}, {id: 1, value: {size: 1}}];
    const sortAccessor = (row: Row): unknown => (row.value as {size: number}).size;

    expect(
      sortRows(rows, 'asc', {sortAccessor, sortComparator})
        .map(row => row.id),
    )
      .toEqual([1, 0]);
    expect(sortComparator)
      .toHaveBeenCalledWith(expect.any(Number), expect.any(Number), 'value');
  });

  it('keeps empty values last without passing them to the comparator', () => {
    const sortComparator = vi.fn((a: unknown, b: unknown) => Number(a) - Number(b));

    expect(sortValues([2, null, 1, undefined, 3], 'desc', {sortComparator}))
      .toEqual([3, 2, 1, null, undefined]);
    expect(sortComparator.mock.calls.every(([a, b]) => !isEmpty(a) && !isEmpty(b)))
      .toBe(true);
  });
});

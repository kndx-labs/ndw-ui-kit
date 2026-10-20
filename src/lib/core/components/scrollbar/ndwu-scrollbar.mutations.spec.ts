import {describe, expect, it} from 'vitest';
import {resolveMutationRecalc} from './ndwu-scrollbar.mutations';

const records = (...types: MutationRecordType[]): Array<{type: MutationRecordType}> => {
  return types.map(type => ({type}));
};

describe('resolveMutationRecalc', () => {
  it('requires a full recalculation when nodes are added or removed', () => {
    expect(resolveMutationRecalc(records('childList'))).toBe('full');
  });

  it('requires a full recalculation when a batch mixes node changes with other changes', () => {
    expect(resolveMutationRecalc(records('characterData', 'attributes', 'childList'))).toBe('full');
  });

  it('allows a content size check for text changes', () => {
    expect(resolveMutationRecalc(records('characterData'))).toBe('check');
  });

  it('allows a content size check for attribute changes', () => {
    expect(resolveMutationRecalc(records('attributes', 'characterData'))).toBe('check');
  });
});

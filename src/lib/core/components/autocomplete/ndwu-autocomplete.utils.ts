import type {NdwuOptionGroup} from '../../../shared.types';
import type {NdwuAutocompleteFilter, NdwuAutocompleteOption, NdwuAutocompleteRow} from './ndwu-autocomplete.types';

export const ndwuAutocompleteContainsFilter: NdwuAutocompleteFilter = (option, query) => {
  return option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase());
};

export function buildAutocompleteRows(
  options: readonly NdwuAutocompleteOption[],
  groups: readonly NdwuOptionGroup[],
): NdwuAutocompleteRow[] {
  const visible = options.filter((option) => !option.hidden);

  if (groups.length === 0) {
    return visible.map((option) => ({kind: 'option', option}));
  }

  const rows: NdwuAutocompleteRow[] = [];
  const groupIds = new Set(groups.map((group) => group.id));

  for (const group of groups) {
    const groupOptions = visible.filter((option) => option.groupId === group.id);

    if (groupOptions.length === 0) {
      continue;
    }

    rows.push({kind: 'group', id: group.id, label: group.label});

    for (const option of groupOptions) {
      rows.push({kind: 'option', option});
    }
  }

  for (const option of visible) {
    if (!option.groupId || !groupIds.has(option.groupId)) {
      rows.push({kind: 'option', option});
    }
  }

  return rows;
}

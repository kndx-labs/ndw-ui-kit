import {isDevMode} from '@angular/core';
import type {NdwuOption, NdwuOptionGroup} from '@ndw-ui-kit/core';

export type NdwuSelectRenderRow =
  | {kind: 'subheader'; id: string; label: string}
  | {kind: 'option'; option: NdwuOption};

export function buildSelectRenderRows(
  options: readonly NdwuOption[],
  groups: readonly NdwuOptionGroup[],
): NdwuSelectRenderRow[] {
  const visible = options.filter((opt) => !opt.hidden);

  // if there are no groups -> flat options list
  if (groups.length === 0) {
    return visible.map((option) => ({kind: 'option', option}));
  }

  const rows: NdwuSelectRenderRow[] = [];
  const groupIds = new Set(groups.map((g) => g.id));

  // group sections in `groups` order
  for (const group of groups) {
    const groupOptions = visible.filter((opt) => opt.groupId === group.id);

    if (groupOptions.length === 0) {
      continue;
    }

    rows.push({kind: 'subheader', id: group.id, label: group.label});

    for (const option of groupOptions) {
      rows.push({kind: 'option', option});
    }
  }

  // ungrouped options —> last section, no subheader.
  for (const option of visible) {
    if (!option.groupId || !groupIds.has(option.groupId)) {
      // **N.B.** A set `groupId` that matches no group is a likely typo: warn in dev.
      if (isDevMode() && option.groupId && !groupIds.has(option.groupId)) {
        const msgChunks = [
          `[ndw-ui-kit] select field: option value=${String(option.value)} has groupId="${option.groupId}"`,
          'with no matching group; rendering it in the ungrouped section.',
        ];

        console.warn(msgChunks.join(' '));
      }

      rows.push({kind: 'option', option});
    }
  }

  return rows;
}

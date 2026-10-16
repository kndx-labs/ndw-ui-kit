import {isDevMode} from '@angular/core';

export interface OptionRowSource {
  value: string | number;
  hidden?: boolean;
  groupId?: string;
}

export interface OptionRowGroup {
  id: string;
  label: string;
}

export type OptionRow<O extends OptionRowSource> =
  | {kind: 'group'; id: string; label: string}
  | {kind: 'option'; option: O};

export function buildOptionRows<O extends OptionRowSource>(
  options: readonly O[],
  groups: readonly OptionRowGroup[],
): OptionRow<O>[] {
  const visible = options.filter((opt) => !opt.hidden);

  // if there are no groups -> flat options list
  if (groups.length === 0) {
    return visible.map((option) => ({kind: 'option', option}));
  }

  const rows: OptionRow<O>[] = [];
  const groupIds = new Set(groups.map((g) => g.id));

  // group sections in `groups` order
  for (const group of groups) {
    const groupOptions = visible.filter((opt) => opt.groupId === group.id);

    if (groupOptions.length === 0) {
      continue;
    }

    rows.push({kind: 'group', id: group.id, label: group.label});

    for (const option of groupOptions) {
      rows.push({kind: 'option', option});
    }
  }

  // ungrouped options —> last section, no group header.
  for (const option of visible) {
    if (!option.groupId || !groupIds.has(option.groupId)) {
      // **N.B.** A set `groupId` that matches no group is a likely typo: warn in dev.
      if (isDevMode() && option.groupId && !groupIds.has(option.groupId)) {
        const msgChunks = [
          `[ndw-ui-kit] option value=${String(option.value)} has groupId="${option.groupId}"`,
          'with no matching group; rendering it in the ungrouped section.',
        ];

        console.warn(msgChunks.join(' '));
      }

      rows.push({kind: 'option', option});
    }
  }

  return rows;
}

export function optionRowKey(row: OptionRow<OptionRowSource>): string {
  return row.kind === 'option' ? `opt:${row.option.value}` : `grp:${row.id}`;
}

export function optionGroupHeaderId(ownerId: string, groupId: string): string {
  // Sanitize: a raw groupId may contain spaces/punctuation, which would
  // produce an invalid id and split the aria-describedby IDREF into
  // broken tokens. The same sanitized value is used on both the
  // group header id and the option's aria-describedby, so they still match.
  const sanitizedId = groupId.replace(/[^A-Za-z0-9_-]/g, '-');

  return `${ownerId}-grp-${sanitizedId}`;
}

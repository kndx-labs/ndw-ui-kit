import {ColorControl} from '@storybook/addon-docs/blocks';
import {UndoIcon} from '@storybook/icons';
import {type ReactElement, createElement, useCallback, useEffect, useRef, useState} from 'react';
import {AddonPanel, Button} from 'storybook/internal/components';
import {
  useAddonState,
  useArgs,
  useChannel,
  useParameter,
  useStorybookApi,
  useStorybookState,
} from 'storybook/manager-api';
import {styled} from 'storybook/theming';
import {
  CSS_TOKENS_ADDON_ID,
  CSS_TOKENS_EVENT,
  CSS_TOKENS_PARAM_KEY,
  type CssTokenGroup,
  type CssTokenOverrides,
  type CssTokenOverridesByStory,
  type CssTokenValue,
  type CssTokenValues,
  type CssTokensValuesPayload,
  EMPTY_OVERRIDES,
  EMPTY_VALUES,
  cssTokenName,
  groupTokenNames,
  isGroupActive,
  withOverride,
  withoutStoryOverrides,
} from './shared';

interface CssTokensPanelProps {
  readonly active: boolean;
}

interface TokenOverrides {
  readonly overrides: CssTokenOverrides;
  readonly generationOf: (name: string) => number;
  readonly edit: (name: string, generation: number, value?: string) => void;
  readonly reset: (name: string) => void;
  readonly resetAll: (names: readonly string[]) => void;
}

interface TokenRowProps {
  readonly name: string;
  readonly storyId: string;
  readonly generation: number;
  readonly value: CssTokenValue | undefined;
  readonly override: string | undefined;
  readonly onEdit: (name: string, generation: number, value?: string) => void;
  readonly onReset: (name: string) => void;
}

interface TokensToolbarProps {
  readonly count: number;
  readonly onResetAll: () => void;
}

const COLUMN_TITLES = ['Name', 'Default', 'Current', 'Value', ''] as const;

const EMPTY_ARGS: Readonly<Record<string, unknown>> = {};

const Toolbar = styled.div(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 12px',
  borderBottom: `1px solid ${theme.appBorderColor}`,
}));

const Table = styled.table(({theme}) => ({
  'width': '100%',
  'borderCollapse': 'collapse',
  'fontSize': theme.typography.size.s2,
  '& th, & td': {
    padding: '6px 12px',
    borderBottom: `1px solid ${theme.appBorderColor}`,
    textAlign: 'left',
    verticalAlign: 'middle',
  },
}));

const GroupTitle = styled.th(({theme}) => ({
  background: theme.background.app,
  fontWeight: theme.typography.weight.bold,
}));

const Mono = styled.code(({theme}) => ({
  fontFamily: theme.typography.fonts.mono,
}));

const Swatch = styled.span({
  'display': 'inline-flex',
  'width': 24,
  'height': 24,
  'overflow': 'hidden',
  'borderRadius': 4,
  'border': '1px solid rgba(0, 0, 0, 0.15)',
  'backgroundColor': '#fff',
  'backgroundImage': 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), '
    + 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)',
  'backgroundSize': '8px 8px',
  'backgroundPosition': '0 0, 4px 4px',
  '& > span': {flex: 1},
});

const slotKey = (storyId: string, name: string): string => {
  return `${storyId}|${name}`;
};

const useTokenValues = (storyId: string): CssTokenValues => {
  const [values, setValues] = useState<CssTokensValuesPayload | null>(null);

  useChannel({
    [CSS_TOKENS_EVENT.VALUES]: (payload: CssTokensValuesPayload) => setValues(payload),
  });

  return values?.storyId === storyId ? values.tokens : EMPTY_VALUES;
};

const useTokenOverrides = (storyId: string): TokenOverrides => {
  const api = useStorybookApi();
  const [map, setMap] = useAddonState<CssTokenOverridesByStory>(CSS_TOKENS_ADDON_ID, {});
  const generations = useRef<Record<string, number>>({});
  const [, setTick] = useState(0);
  const storyOverrides = map[storyId];

  const bump = useCallback((names: readonly string[]) => {
    names.forEach((name) => {
      const key = slotKey(storyId, name);

      generations.current[key] = (generations.current[key] ?? 0) + 1;
    });
    setTick((tick) => tick + 1);
  }, [storyId]);

  const edit = useCallback((name: string, generation: number, value?: string) => {
    if ((generations.current[slotKey(storyId, name)] ?? 0) !== generation) {
      return;
    }

    setMap((current) => withOverride(current, storyId, name, value));
  }, [setMap, storyId]);

  const reset = useCallback((name: string) => {
    bump([name]);
    setMap((current) => withOverride(current, storyId, name, undefined));
  }, [bump, setMap, storyId]);

  const resetAll = useCallback((names: readonly string[]) => {
    bump(names);
    setMap((current) => withoutStoryOverrides(current, storyId));
  }, [bump, setMap, storyId]);

  useEffect(() => {
    api.emit(CSS_TOKENS_EVENT.SET, {storyId, overrides: storyOverrides ?? EMPTY_OVERRIDES});
  }, [api, storyId, storyOverrides]);

  return {
    overrides: storyOverrides ?? EMPTY_OVERRIDES,
    generationOf: (name) => generations.current[slotKey(storyId, name)] ?? 0,
    edit,
    reset,
    resetAll,
  };
};

const TokenRow = ({name, storyId, generation, value, override, onEdit, onReset}: TokenRowProps): ReactElement => {
  const onChange = useCallback((next?: string) => onEdit(name, generation, next), [onEdit, name, generation]);
  const overridden = override !== undefined;
  const computed = value?.computed ?? '';

  return createElement(
    'tr',
    null,
    createElement('td', null, createElement(overridden ? 'strong' : 'span', null, name)),
    createElement('td', null, value?.default === undefined ? '—' : createElement(Mono, null, value.default)),
    createElement(
      'td',
      null,
      createElement(Swatch, {title: computed}, createElement('span', {style: {background: computed}})),
    ),
    createElement(
      'td',
      null,
      createElement(ColorControl, {
        key: `${storyId}:${name}:${generation}`,
        name,
        onChange,
        ...(overridden ? {value: override} : {}),
      }),
    ),
    createElement(
      'td',
      null,
      createElement(
        Button,
        {variant: 'ghost', padding: 'small', ariaLabel: `Reset ${name}`, disabled: !overridden,
          onClick: () => onReset(name)},
        createElement(UndoIcon),
      ),
    ),
  );
};

const TokensToolbar = ({count, onResetAll}: TokensToolbarProps): ReactElement => {
  return createElement(
    Toolbar,
    null,
    createElement(
      Button,
      {variant: 'outline', padding: 'small', ariaLabel: false, disabled: count === 0, onClick: onResetAll},
      'Reset all',
    ),
    count === 0 ? null : createElement('span', null, `${count} overridden`),
  );
};

const groupRows = (
  group: CssTokenGroup,
  storyId: string,
  tokens: CssTokenValues,
  state: TokenOverrides,
): ReactElement[] => {
  const names = group.keys.map(cssTokenName);

  return [
    createElement(
      'tr',
      {key: `group:${group.title}`},
      createElement(GroupTitle, {colSpan: COLUMN_TITLES.length}, group.title),
    ),
    ...names.map((name) =>
      createElement(TokenRow, {
        key: name,
        name,
        storyId,
        generation: state.generationOf(name),
        value: tokens[name],
        override: state.overrides[name],
        onEdit: state.edit,
        onReset: state.reset,
      })
    ),
  ];
};

export const CssTokensPanel = ({active}: CssTokensPanelProps): ReactElement => {
  const groups = useParameter<readonly CssTokenGroup[]>(CSS_TOKENS_PARAM_KEY, []);
  const {storyId} = useStorybookState();
  const [args = EMPTY_ARGS] = useArgs() as [Readonly<Record<string, unknown>> | undefined, ...unknown[]];
  const tokens = useTokenValues(storyId);
  const state = useTokenOverrides(storyId);
  const visibleGroups = groups.filter((group) => isGroupActive(group, args));

  const toolbar = createElement(TokensToolbar, {
    count: Object.keys(state.overrides).length,
    onResetAll: () => state.resetAll(groupTokenNames(groups)),
  });
  const head = createElement(
    'thead',
    null,
    createElement('tr', null, ...COLUMN_TITLES.map((title) => createElement('th', {key: title}, title))),
  );
  const body = createElement(
    'tbody',
    null,
    ...visibleGroups.flatMap((group) => groupRows(group, storyId, tokens, state)),
  );

  return createElement(AddonPanel, {
    active,
    children: createElement('div', null, toolbar, createElement(Table, null, head, body)),
  });
};

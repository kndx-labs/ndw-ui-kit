import {ComponentSetLike} from './types';

export const sanitizeName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\p{L}\p{N}\-_/]/gu, '-')
    .replace(/-+/g, '-')
    .replace(/\/-/g, '/')
    .replace(/-\//g, '/')
    .replace(/^-|-$/g, '');
};

const traverseNodes = <TNode extends {children?: TNode[]}>(
  node: TNode | undefined,
  callback: (node: TNode, depth: number) => void,
  depth = 0,
): void => {
  if (!node) {
    return;
  }

  callback(node, depth);

  if (node.children) {
    for (const child of node.children) {
      traverseNodes(child, callback, depth + 1);
    }
  }
};

interface VariantParts {
  size: string | null;
  extras: string[];
}

export const parseVariantProperties = (variantName: string): VariantParts => {
  const parts = variantName.split(',').map((p) => p.trim());
  let size: string | null = null;
  const extras: string[] = [];

  for (const part of parts) {
    const sizeMatch = part.match(/^size=([A-Z0-9]+)$/i);

    if (sizeMatch) {
      size = sizeMatch[1].toLowerCase();
      continue;
    }

    const eqIdx = part.indexOf('=');

    if (eqIdx !== -1) {
      extras.push(sanitizeName(part.slice(eqIdx + 1)));
    }
  }

  return {size, extras};
};

const SIZE_SUFFIX_MAP: Record<string, string> = {
  xs: 'XS',
  s: 'S',
  l: 'L',
  xl: 'XL',
};

const toUnderscore = (name: string): string => name.replace(/-/g, '_');

const buildPreprocessNameParts = (baseName: string, extras: string[]): string[] =>
  [toUnderscore(baseName), ...extras.map(toUnderscore)].filter(Boolean);

export const buildPreprocessIconFilename = (
  baseName: string,
  size: string,
  extras: string[],
): string | null => {
  const suffix = SIZE_SUFFIX_MAP[size];

  if (!suffix) {
    return null;
  }

  return `${buildPreprocessNameParts(baseName, extras).join('_')}_${suffix}.svg`;
};

export const buildPreprocessPictogramFilename = (
  baseName: string,
  size: string,
  extras: string[],
): string | null => {
  const suffix = size === 'l' ? 'L' : size === 'xl' ? 'XL' : '';

  if (!suffix) {
    return null;
  }

  return `pictogram_${buildPreprocessNameParts(baseName, extras).join('_')}_${suffix}.svg`;
};

export const collectComponentSets = (node: ComponentSetLike | undefined): ComponentSetLike[] => {
  const result: ComponentSetLike[] = [];

  traverseNodes(node, (n) => {
    if (n.type === 'COMPONENT_SET') {
      result.push(n);
    }
  });

  return result;
};

import * as path from 'node:path';
import {ROOT_DIR, requireEnv} from '../conf';

export const FIGMA_FILE_KEY = requireEnv('FIGMA_FILE_KEY');
export const FIGMA_ICONS_NODE_ID = requireEnv('FIGMA_ICONS_NODE_ID');
export const FIGMA_PICTOGRAMS_NODE_ID = requireEnv('FIGMA_PICTOGRAMS_NODE_ID');

export const FIGMA_DATA_DIRS = {
  icons: process.env.FIGMA_ICONS_DATA_DIR
    ? path.resolve(process.env.FIGMA_ICONS_DATA_DIR)
    : path.resolve(ROOT_DIR, 'scripts/data/icons'),
};

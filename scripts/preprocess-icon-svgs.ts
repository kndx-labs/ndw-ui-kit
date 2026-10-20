#!/usr/bin/env tsx

/* eslint @typescript-eslint/no-unsafe-argument: 0, @typescript-eslint/no-unsafe-member-access: 0 */
import {Builder, parseString} from 'xml2js';
import {promisify} from 'node:util';
import chalk from 'chalk';
import {SPRITE_ICONS_DIR} from './conf';
import {ICON_EXPECTED_DIMENSIONS} from './utils/sprite/svg';
import {normalizeColor} from './utils/fmt';
import {type SvgTransformResult, isPictogramFile, runSvgPreprocess} from './utils/sprite/preprocess';

const parseXML = promisify(parseString);

const SVG_CHILD_ELEMENTS = ['path', 'circle', 'rect', 'ellipse', 'line', 'polygon', 'polyline', 'g'] as const;

/**
 * Recursively replace every fill/stroke color in the element tree with `toColor`.
 * Absent attributes and null-normalized values (none, transparent) are left as is.
 */
const replaceAllColors = (element: any, toColor: string): void => {
  if (normalizeColor(element.$?.fill) !== null) {
    element.$.fill = toColor;
  }

  if (normalizeColor(element.$?.stroke) !== null) {
    element.$.stroke = toColor;
  }

  for (const childType of SVG_CHILD_ELEMENTS) {
    if (element[childType]) {
      for (const child of (Array.isArray(element[childType]) ? element[childType] : [element[childType]])) {
        replaceAllColors(child, toColor);
      }
    }
  }
};

const buildXml = (obj: any): string => {
  const builder = new Builder({
    headless: true,
    renderOpts: {pretty: false},
  });

  return builder.buildObject(obj);
};

const transformIcon = async (content: string): Promise<SvgTransformResult> => {
  const parsed = await parseXML(content) as any;

  if (!parsed.svg) {
    return {ok: false, reason: 'Invalid SVG structure'};
  }

  replaceAllColors(parsed.svg, 'currentColor');

  return {ok: true, content: buildXml(parsed)};
};

runSvgPreprocess({
  label: 'icon',
  webhookTitle: 'Icon Preprocessing Failures',
  outputDir: SPRITE_ICONS_DIR,
  include: (file) => !isPictogramFile(file),
  expectedDimensions: ICON_EXPECTED_DIMENSIONS,
  transform: transformIcon,
})
  .catch((error: unknown) => {
    console.error(chalk.red('Icon preprocessing failed:'), error);
    process.exit(1);
  });

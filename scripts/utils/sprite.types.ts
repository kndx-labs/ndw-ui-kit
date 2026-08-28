import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';

export interface SpriteCompileResource {
  path: string;
  contents: string | NodeJS.ArrayBufferView;
}

export type SpriteCompileMode = Record<string, SpriteCompileResource>;

export type SpriteCompileResult = Record<string, SpriteCompileMode>;

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isSpriteCompileResource = (value: unknown): value is SpriteCompileResource => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return typeof value.path === 'string' && (typeof value.contents === 'string' || ArrayBuffer.isView(value.contents));
};

const isSpriteCompileMode = (value: unknown): value is SpriteCompileMode => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Object.values(value).every(isSpriteCompileResource);
};

export const isSpriteCompileResult = (value: unknown): value is SpriteCompileResult => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Object.values(value).every(isSpriteCompileMode);
};

export const writeCompileResult = (result: SpriteCompileResult): void => {
  for (const resources of Object.values(result)) {
    for (const {path: outputPath, contents} of Object.values(resources)) {
      mkdirSync(dirname(outputPath), {recursive: true});
      writeFileSync(outputPath, contents);
    }
  }
};

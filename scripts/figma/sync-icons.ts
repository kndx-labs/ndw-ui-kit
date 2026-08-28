#!/usr/bin/env tsx
import {createWriteStream, mkdirSync, readdirSync, unlinkSync} from 'node:fs';
import * as path from 'node:path';
import {Readable} from 'node:stream';
import {ReadableStream} from 'node:stream/web';
import {pipeline} from 'node:stream/promises';
import {figmaApi} from './api';
import {FIGMA_DATA_DIRS, FIGMA_FILE_KEY, FIGMA_ICONS_NODE_ID, FIGMA_PICTOGRAMS_NODE_ID} from './config';
import {
  buildPreprocessIconFilename,
  buildPreprocessPictogramFilename,
  collectComponentSets,
  parseVariantProperties,
  sanitizeName,
} from './utils';
import {createSemaphore, getConcurrency, withRetry} from './concurrency';
import {ComponentSetLike} from './types';

interface FigmaImageResponse {
  images: Record<string, string | null>;
}

interface DownloadItem {
  nodeId: string;
  filename: string;
  destPath: string;
}

const downloadSvg = async (url: string, destPath: string): Promise<void> => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }

  if (!res.body) {
    throw new Error('Download failed: empty response body');
  }

  await pipeline(
    Readable.fromWeb(res.body as ReadableStream),
    createWriteStream(destPath),
  );
};

type FigmaNode = Record<string, {document: ComponentSetLike | undefined}>;

const syncSection = async (
  sectionNodeId: string,
  sectionType: 'Icons' | 'Pictograms',
): Promise<string[]> => {
  const isIcons = sectionType === 'Icons';
  const outDir = FIGMA_DATA_DIRS.icons;

  mkdirSync(outDir, {recursive: true});

  console.log(`\n📦 Fetching ${sectionType} structure from Figma...`);

  const endpoint = `/files/${FIGMA_FILE_KEY}/nodes?ids=${sectionNodeId}&depth=3`;
  const fileData = await figmaApi<{nodes: FigmaNode}>(endpoint);
  const sectionNode = fileData.nodes[sectionNodeId]?.document;

  if (!sectionNode) {
    throw new Error(`Could not find node ${sectionNodeId} in Figma file`);
  }

  const componentSets = collectComponentSets(sectionNode);

  console.log(`   Found ${componentSets.length} component sets`);

  const downloadList: DownloadItem[] = [];

  for (const compSet of componentSets) {
    let baseName = compSet.name || 'unnamed';

    if (sectionType === 'Pictograms') {
      baseName = baseName.replace(/^pictogram\s+/iu, '');
    }

    baseName = sanitizeName(baseName);

    if (!compSet.children || compSet.children.length === 0) {
      continue;
    }

    for (const variant of compSet.children) {
      if (variant.type !== 'COMPONENT') {
        continue;
      }

      const {size, extras} = parseVariantProperties(variant.name);

      if (!size) {
        continue;
      }

      const filename = isIcons
        ? buildPreprocessIconFilename(baseName, size, extras)
        : buildPreprocessPictogramFilename(baseName, size, extras);

      if (!filename) {
        continue;
      }

      downloadList.push({
        nodeId: variant.id,
        filename,
        destPath: path.join(outDir, filename),
      });
    }
  }

  console.log(`   Prepared ${downloadList.length} SVG downloads`);

  const nodeIds = downloadList.map((d) => d.nodeId);
  const batchSize = 100;
  const limit = createSemaphore(getConcurrency());
  const downloadTasks: Promise<void>[] = [];

  for (let i = 0; i < nodeIds.length; i += batchSize) {
    const batch = nodeIds.slice(i, i + batchSize);
    const idsParam = batch.join(',');
    const imageEndpoint = `/images/${FIGMA_FILE_KEY}?ids=${idsParam}&format=svg`;
    const imageData = await withRetry(() => figmaApi<FigmaImageResponse>(imageEndpoint));

    for (const item of downloadList.slice(i, i + batchSize)) {
      const imageUrl = imageData.images[item.nodeId];

      if (!imageUrl) {
        console.warn(`   ⚠️  No SVG URL for ${item.filename}`);
        continue;
      }

      downloadTasks.push(
        limit(async () => {
          await withRetry(() => downloadSvg(imageUrl, item.destPath));
          console.log(`   ✅ ${item.filename}`);
        }),
      );
    }
  }

  await Promise.all(downloadTasks);

  console.log(`   Done. Downloaded: ${downloadList.length}`);

  return downloadList.map((d) => d.filename);
};

const cleanupOrphaned = (outDir: string, expectedFiles: string[]): void => {
  const expectedSet = new Set(expectedFiles);
  const existingFiles = readdirSync(outDir).filter((f) => f.endsWith('.svg'));

  let removed = 0;

  for (const file of existingFiles) {
    if (!expectedSet.has(file)) {
      unlinkSync(path.join(outDir, file));
      console.log(`   🗑️  Removed orphaned: ${file}`);

      removed++;
    }
  }

  if (removed > 0) {
    console.log(`   Cleaned up ${removed} orphaned file(s)`);
  }
};

const main = async (): Promise<void> => {
  console.log('🚀 Starting Figma icon sync...');
  console.log(`   File key: ${FIGMA_FILE_KEY}`);

  try {
    const [iconFilenames, pictogramFilenames] = await Promise.all([
      syncSection(FIGMA_ICONS_NODE_ID, 'Icons'),
      syncSection(FIGMA_PICTOGRAMS_NODE_ID, 'Pictograms'),
    ]);

    // Run cleanup once with the combined expected set so icons don't delete
    // pictograms (and vice versa) since both live in the same directory.
    cleanupOrphaned(FIGMA_DATA_DIRS.icons, [...iconFilenames, ...pictogramFilenames]);

    console.log('\n🎉 Sync completed successfully!');
  } catch (err) {
    console.error('\n❌ Sync failed:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
};

void main();

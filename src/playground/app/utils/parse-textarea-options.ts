import type {NdwuOption} from '@ndw-ui-kit/core';

/**
 * Parses textarea content into NdwuOption[]: one option per line, trimmed, blank lines removed.
 * Each line becomes { id: line, label: line }.
 */
export const parseTextareaOptions = (text: string): NdwuOption[] => {
  if (!text) {
    return [];
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => ({value: line, label: line}));
};

import {requireEnv} from '../conf';

const DEFAULT_BASE_URL = 'https://api.figma.com/v1';

const FIGMA_API_KEY = requireEnv('FIGMA_API_KEY');

interface FigmaApiOptions {
  baseUrl?: string;
  apiKey?: string;
}

export const figmaApi = async <TResponse = unknown>(
  endpoint: string,
  options: FigmaApiOptions = {},
): Promise<TResponse> => {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const apiKey = options.apiKey ?? FIGMA_API_KEY;
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(
    url,
    {
      headers: {
        'X-Figma-Token': apiKey,
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(`Figma API error ${response.status}: ${body}`);
  }

  return response.json() as Promise<TResponse>;
};

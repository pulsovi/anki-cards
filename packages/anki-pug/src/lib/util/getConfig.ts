import configGetter from '../getConfig';
import type { AnkiPugConfig } from '../getConfig';

const cache: Record<string, AnkiPugConfig> = {};
export function getConfig (argv: Partial<AnkiPugConfig> | null = null): AnkiPugConfig {
  const key = JSON.stringify(argv);
  if (!(key in cache)) cache[key] = configGetter(argv);
  return cache[key];
}

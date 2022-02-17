import type { AnkiPugConfig } from './getConfig';
import { todo } from './util';

Error.stackTraceLimit = 100;

// eslint-disable-next-line import/prefer-default-export
export async function diff (argv: Partial<AnkiPugConfig> | null = null): Promise<void> {
  await Promise.resolve(todo(argv));
}

import type { AnkiConnect } from './ankiConnection';
import type { AnkiPugConfig } from './getConfig';

export * from './ankiConnection';
export * from './getConfig';

export interface Services {
  ankiConnection: AnkiConnect;
  config: AnkiPugConfig;
}

import type { AnkiConnect } from './ankiConnection';
import type { AnkiPugConfig } from './getConfig';
import type { ModelItemFactory } from './modelItemFactory';

export * from './ankiConnection';
export * from './getConfig';
export * from './modelItemFactory';

export interface Services {
  ankiConnection: AnkiConnect;
  config: AnkiPugConfig;
  modelItemFactory: ModelItemFactory;
}

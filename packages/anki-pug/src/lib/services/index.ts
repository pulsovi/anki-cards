import ModelItemFactory from '../ModelItemFactory';

import type { AnkiConnect } from './ankiConnection';
import type { AnkiPugConfig } from './getConfig';

export * from './ankiConnection';
export * from './getConfig';

export const modelItemFactory = new ModelItemFactory();

export interface Services {
  ankiConnection: AnkiConnect;
  config: AnkiPugConfig;
  modelItemFactory: ModelItemFactory;
}

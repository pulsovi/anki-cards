import type ModelItemFactory from '../ModelItemFactory';
import { todo } from '../util';

import type { AnkiConnect } from './ankiConnection';
import type { AnkiPugConfig } from './getConfig';

export * from './ankiConnection';
export * from './getConfig';

export const modelItemFactory = todo('créer une instance de ModelItemFactory') as ModelItemFactory;

export interface Services {
  ankiConnection: AnkiConnect;
  config: AnkiPugConfig;
  modelItemFactory: ModelItemFactory;
}

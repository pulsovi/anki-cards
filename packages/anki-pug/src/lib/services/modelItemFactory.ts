import ModelItemFactory from '../ModelItemFactory';
import ModelItemMedia from '../ModelItemMedia';

import { ankiConnection } from './ankiConnection';

export const modelItemFactory = new ModelItemFactory({ ankiConnection });
modelItemFactory.registerModelItemVariation(ModelItemMedia);

export type { ModelItemFactory };

import ModelItemFactory from '../ModelItemFactory';
import ModelItemMedia from '../ModelItemMedia';
import ModelItemStyle from '../ModelItemStyle';
import ModelItemTemplate from '../ModelItemTemplate';

import { ankiConnection } from './ankiConnection';

export const modelItemFactory = new ModelItemFactory({ ankiConnection });
modelItemFactory.registerModelItemVariation(ModelItemMedia);
modelItemFactory.registerModelItemVariation(ModelItemStyle);
modelItemFactory.registerModelItemVariation(ModelItemTemplate);

export type { ModelItemFactory };

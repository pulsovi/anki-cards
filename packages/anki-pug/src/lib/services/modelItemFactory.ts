import ModelItemFactory from '../ModelItemFactory';
import ModelItemMedia from '../ModelItemMedia';

export const modelItemFactory = new ModelItemFactory();
modelItemFactory.registerModelItemVariation(ModelItemMedia);

export type { ModelItemFactory };

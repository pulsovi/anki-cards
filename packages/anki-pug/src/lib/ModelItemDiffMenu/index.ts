import type { ModelItemType } from '../ModelItem';

import ModelItemDiffMenu from './ModelItemDiffMenu';

export default ModelItemDiffMenu;

export type NullablePair<T> = T extends unknown ? [T | null | Error, T | null | Error] : never;
export type ModelItemPair = NullablePair<ModelItemType>;

import type DiffConfig from '../DiffConfig';
import Menu from '../Menu/Menu';
import type ModelItem from '../ModelItem';
import type ModelItemDiffManager from '../ModelItemDiffManager';
import type { TaskSyncer } from '../util';

import type ModelItemDiffMenuItem from './ModelItemDiffMenuItem';
import NewlineAtEofFilter from './NewlineAtEofFilter';
import No from './No';
import NoDiffResponse from './NoDiffResponse';
import Overwrite from './Overwrite';
import Quit from './Quit';
import Word from './Word';

import type { ModelItemPair } from '.';

const items: (new (menu: ModelItemDiffMenu) => ModelItemDiffMenuItem)[] = [
  // filters
  NewlineAtEofFilter,

  // sync responses
  NoDiffResponse,

  // choices
  No,
  Overwrite,
  Word,
  Quit,
];

/** GUI menu to manage diffs found on model items (templates, stylesheet, medias) */
export default class ModelItemDiffMenu extends Menu<ModelItemPair> {
  protected readonly items: ModelItemDiffMenuItem[];
  protected readonly syncer: TaskSyncer;

  private readonly diffManager: ModelItemDiffManager;
  private readonly diffConfig: DiffConfig;

  public constructor (diffManager: ModelItemDiffManager, diffConfig: DiffConfig, syncer: TaskSyncer) {
    super(`Compare ${diffManager.getModelItem().getName()} ?`, syncer);
    this.items = items.map(Item => new Item(this));
    this.diffConfig = diffConfig;
    this.diffManager = diffManager;
    this.syncer = syncer;
  }

  public getDiffConfig (): DiffConfig {
    return this.diffConfig;
  }

  public getModelItem (): ModelItem {
    return this.diffManager.getModelItem();
  }

  protected async getData (): Promise<ModelItemPair> {
    const item = this.getModelItem();
    return (await Promise.all([
      item.getAnki(),
      item.getCompiledPug(),
    ])) as ModelItemPair;
  }
}

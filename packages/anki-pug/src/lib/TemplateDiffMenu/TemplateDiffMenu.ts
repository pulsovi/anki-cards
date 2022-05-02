import type DiffConfig from '../DiffConfig';
import Menu from '../Menu/Menu';
import type Template from '../Template';
import type TemplateDiffManager from '../TemplateDiffManager';
import type { TaskSyncer } from '../util';

import NewlineAtEofFilter from './NewlineAtEofFilter';
import No from './No';
import NoDiffResponse from './NoDiffResponse';
import Overwrite from './Overwrite';
import Quit from './Quit';
import type TemplateDiffMenuItem from './TemplateDiffMenuItem';
import Word from './Word';

const items: (new (menu: TemplateDiffMenu) => TemplateDiffMenuItem)[] = [
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

export default class TemplateDiffMenu extends Menu<[string, string]> {
  protected readonly items: TemplateDiffMenuItem[];
  protected readonly syncer: TaskSyncer;

  private readonly diffManager: TemplateDiffManager;
  private readonly diffConfig: DiffConfig;

  public constructor (diffManager: TemplateDiffManager, diffConfig: DiffConfig, syncer: TaskSyncer) {
    super(`Compare ${diffManager.getTemplate().getName()} ?`, syncer);
    this.items = items.map(Item => new Item(this));
    this.diffConfig = diffConfig;
    this.diffManager = diffManager;
    this.syncer = syncer;
  }

  public getDiffConfig (): DiffConfig {
    return this.diffConfig;
  }

  public getTemplate (): Template {
    return this.diffManager.getTemplate();
  }

  protected async getData (): Promise<[string, string]> {
    return await Promise.all([
      this.getTemplate().getCurrentOutput().then(text => text ?? ''),
      this.getTemplate().getCompiledPug(),
    ]);
  }
}

import { TaskSyncer, todo } from './util';

export default class ModuleLoader {
  private readonly modulepath: string;

  public constructor (modulepath: string) {
    this.modulepath = modulepath;
  }

  public async load (syncer = new TaskSyncer()): Promise<unknown> {
    return await Promise.resolve(todo(this, syncer));
  }
}

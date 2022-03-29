import type { ExpandChoiceOptions } from 'inquirer';

import type DiffConfig from './DiffConfig';
import type { TaskSyncer } from './util';

interface MenuChoiceOption extends ExpandChoiceOptions {
  value: MenuItem;
}

export default abstract class MenuItem {
  protected abstract readonly key: string;
  protected abstract readonly name: string;

  public getChoice (): MenuChoiceOption {
    return {
      key: this.key,
      name: this.name,
      value: this,
    };
  }

  // concrete MenuItem can need use of `this`
  // eslint-disable-next-line class-methods-use-this
  public getDefault (previousDefault: MenuItem): MenuItem {
    return previousDefault;
  }

  public abstract process (diffConfig: DiffConfig, ticket?: TaskSyncer): Promise<boolean>;
}

import type { ExpandChoiceOptions } from 'inquirer';

import type DiffConfig from './DiffConfig';
import type Template from './Template';
import type { TaskSyncer } from './util';

interface MenuChoiceOption extends ExpandChoiceOptions {
  value: MenuItem;
}

export default abstract class MenuItem {
  protected readonly template: Template;

  protected abstract readonly key: string;
  protected abstract readonly name: string;

  public constructor (template: Template) {
    this.template = template;
  }

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

  public abstract process (diffConfig: DiffConfig, ticket: TaskSyncer): Promise<boolean>;
}

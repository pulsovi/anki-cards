import type { ExpandChoiceOptions } from 'inquirer';

import type Menu from './Menu';

export interface MenuChoiceOption extends ExpandChoiceOptions {
  value: MenuItem;
}

export default abstract class MenuItem {
  protected readonly menu: Menu;

  protected key: string | null = null;
  protected name: string | null = null;

  public constructor (menu: Menu) {
    this.menu = menu;
  }

  public getChoice (): MenuChoiceOption | null {
    if (!this.key || !this.name) return null;
    return {
      key: this.key,
      name: this.name,
      value: this,
    };
  }

  public getDefault (previousDefault: MenuItem): MenuItem {
    return previousDefault;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async act (..._processArgs: unknown[]): Promise<boolean> {
    throw new Error('MenuItem which return non null value from its getChoice or getResponse methods MUST implements act method too.');
  }
}

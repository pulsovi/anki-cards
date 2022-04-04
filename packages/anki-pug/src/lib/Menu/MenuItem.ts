import type { ExpandChoiceOptions } from 'inquirer';

import type { SyncOrPromise } from '../types';

import type Menu from './Menu';

export default abstract class MenuItem<Data> {
  protected readonly menu: Menu<Data>;

  protected key: string | null = null;
  protected name: string | null = null;

  public constructor (menu: Menu<Data>) {
    this.menu = menu;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async act (..._processArgs: unknown[]): Promise<boolean> {
    throw new Error('MenuItem which return non null value from its getChoice or getResponse methods MUST implements act method too.');
  }

  public cancelResponse (): void {
    throw new Error('MenuItem which return non null value from its getResponse methods MUST implements cancelResponse method too.');
  }

  public filterData (data: SyncOrPromise<Data | null>): SyncOrPromise<Data | null> {
    return data;
  }

  public getChoice (): (ExpandChoiceOptions & { value: MenuItem<Data> }) | null {
    if (!this.key || !this.name) return null;
    return {
      key: this.key,
      name: this.name,
      value: this,
    };
  }

  public getDefault (previousDefault: MenuItem<Data>): MenuItem<Data> {
    return previousDefault;
  }

  public getResponse (_data: Data | null): Promise<this> | null {
    return null;
  }

  public getSyncResponse (_data: Data | null): this | null {
    return null;
  }
}

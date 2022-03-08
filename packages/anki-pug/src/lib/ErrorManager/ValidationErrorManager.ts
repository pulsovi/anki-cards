import { ValidationError } from 'joi';

import type ModuleLoader from '../ModuleLoader';
import { todo } from '../util';

import type { BaseErrorManager } from './types';

export default class ValidationErrorManager<U> implements BaseErrorManager {
  private readonly error: ValidationError;
  private readonly moduleLoader: ModuleLoader<U>;

  public constructor (error: Error, moduleLoader: ModuleLoader<U>) {
    if (error instanceof ValidationError) this.error = error;
    else throw new TypeError(`Le type de l'erreur "${error.name}" n'est pas pris en charge.`);
    this.moduleLoader = moduleLoader;
  }

  public async manage (): Promise<void> {
    await Promise.resolve(todo(this));
  }
}

import { ValidationError } from 'joi';

import { todo } from '../util';

import type { BaseErrorManager } from './types';

export default class ValidationErrorManager implements BaseErrorManager {
  private readonly error: ValidationError;

  public constructor (error: Error) {
    if (error instanceof ValidationError) this.error = error;
    else throw new TypeError(`Le type de l'erreur "${error.name}" n'est pas pris en charge.`);
  }

  public async manage (): Promise<boolean> {
    return await Promise.resolve(todo(this) as boolean);
  }
}

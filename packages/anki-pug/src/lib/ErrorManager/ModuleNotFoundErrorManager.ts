import { todo } from '../util';

import type { ErrorWithCode, BaseErrorManager } from './types';

export default class ModuleNotFoundErrorManager implements BaseErrorManager {
  public constructor (error: ErrorWithCode) {
    if (error.code !== 'MODULE_NOT_FOUND')
      throw new TypeError(`Le code de l'erreur doit être "MODULE_NOT_FOUND", code reçu : "${error.code}"`);
  }

  public async manage (): Promise<void> {
    await Promise.resolve(todo(this));
  }
}

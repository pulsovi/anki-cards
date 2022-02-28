import { todo } from '../util';

import SpecificErrorManager from './SpecificErrorManager';
import type { ErrorWithCode } from './types';

export default class InvalidArgTypeErrorManager extends SpecificErrorManager {
  public constructor (error: ErrorWithCode) {
    if (error.code !== 'ERR_INVALID_ARG_TYPE')
      throw new TypeError(`Le code de l'erreur doit être "MODULE_NOT_FOUND", code reçu : "${error.code}"`);
    super(error);
  }

  public async manage (): Promise<boolean> {
    return await Promise.resolve(todo(this) as boolean);
  }
}

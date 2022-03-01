import BaseErrorManager from './BaseErrorManager';
import InvalidArgTypeErrorManager from './InvalidArgTypeErrorManager';
import ModuleNotFoundErrorManager from './ModuleNotFoundErrorManager';
import type { ErrorWithCode } from './types';

export default class ImportErrorManager extends BaseErrorManager {
  private readonly specificManager: BaseErrorManager;

  public constructor (error: Error) {
    if (!ImportErrorManager.isManageable(error))
      throw new TypeError('Only errors with a "code" property of type string can be handled.');
    super(error);
    if (error.code === 'MODULE_NOT_FOUND')
      this.specificManager = new ModuleNotFoundErrorManager(error);
    else if (error.code === 'ERR_INVALID_ARG_TYPE')
      this.specificManager = new InvalidArgTypeErrorManager(error);
    else {
      console.info(error);
      throw new Error(`Aucun gestionnaire n'est défini pour les erreurs de ce type : "${error.code}".`);
    }
  }

  public static isManageable (error: unknown): error is ErrorWithCode {
    return error instanceof Error && 'code' in error && 'string' === typeof error.code;
  }

  public async manage (): Promise<boolean> {
    return await this.specificManager.manage();
  }
}
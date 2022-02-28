import InvalidArgTypeErrorManager from './InvalidArgTypeErrorManager';
import ModuleNotFoundErrorManager from './ModuleNotFoundErrorManager';
import type SpecificErrorManager from './SpecificErrorManager';
import type { ErrorWithCode } from './types';

export default class ErrorManager<T extends ErrorWithCode> {
  private readonly error: T;
  private readonly specificManager: SpecificErrorManager;

  public constructor (error: T) {
    this.error = error;
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

import type { ErrorWithCode } from './types';

export default abstract class SpecificErrorManager {
  private readonly error: ErrorWithCode;

  public constructor (error: ErrorWithCode) {
    this.error = error;
  }

  public abstract manage (): Promise<boolean>;
}

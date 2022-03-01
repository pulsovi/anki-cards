export default abstract class BaseErrorManager {
  private readonly error: Error;

  public constructor (error: Error) {
    this.error = error;
  }

  public abstract manage (): Promise<boolean>;
}

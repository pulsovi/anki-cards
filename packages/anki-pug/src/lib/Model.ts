import { todo } from './util';

export default class Model {
  public getName (): string {
    return todo(this) as string;
  }
}

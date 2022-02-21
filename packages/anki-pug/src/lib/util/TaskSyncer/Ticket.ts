import { todo } from '../todo';

export default class Ticket {
  public readonly close: () => void;
  public readonly ready: Promise<void> = new Promise(todo);

  public constructor () {
    this.close = todo as () => void;
  }
}

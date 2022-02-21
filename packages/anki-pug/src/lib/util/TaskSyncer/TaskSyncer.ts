import { todo } from '../todo';

export class TaskSyncer {
  public get current (): number {
    return todo(this) as number;
  }
}

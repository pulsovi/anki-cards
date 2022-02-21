import { todo } from '../todo';

import Ticket from './Ticket';

export class TaskSyncer {
  public get current (): number {
    return todo(this) as number;
  }

  public async enqueue<U> (task: () => Promise<U>): Promise<U> {
    return await Promise.resolve(todo(this, task) as U);
  }

  public getTicket (): Ticket {
    return todo(this, Ticket) as Ticket;
  }
}

import { todo } from '../todo';

import Ticket from './Ticket';

export class TaskSyncer {
  private last: Ticket | null = null;
  private running = 0;
  private next = 1;

  public get current (): number {
    return todo(this) as number;
  }

  public async enqueue<U> (task: () => Promise<U>): Promise<U> {
    const ticket = this.getTicket();
    await ticket.ready;
    const taskPromise = task();
    taskPromise.finally(() => { ticket.close(); });
    return await taskPromise;
  }

  public getTicket (): Ticket {
    const number = this.next;
    const ticket = new Ticket(this.last, number);

    this.last = ticket;
    this.next += 1;
    ticket.ready.finally(() => { this.running = number; });
    return ticket;
  }
}

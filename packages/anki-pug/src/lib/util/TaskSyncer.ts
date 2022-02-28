import { getDeferredPromise } from './deferredPromise';
import type { DeferredPromise } from './deferredPromise';

export class TaskSyncer {
  public readonly close: () => void;
  public readonly done: Promise<void>;
  public ready: Promise<void>;

  private readonly tickets: TaskSyncer[] = [];
  private readonly number: number;
  private currentTicket = 0;

  public constructor (
    parent?: TaskSyncer,
    number = 0
  ) {
    this.number = number;

    const deferredPromise: DeferredPromise<void> = getDeferredPromise();
    this.close = deferredPromise.resolve;
    this.done = deferredPromise.promise;
    this.ready = new Promise((resolve, reject) => {
      this.done.finally(() => { reject(new Error('The ticket is already done.')); });
      if (parent) parent.getReady(number).then(resolve, reject);
      else resolve();
    });
  }

  public async enqueue<U> (task: (syncer: TaskSyncer) => Promise<U>): Promise<U> {
    const ticket = this.getTicket();
    await ticket.ready;
    const status: {
      isError: boolean;
      value?: U;
      reason?: unknown;
    } = { isError: false };
    try {
      status.value = await task(ticket);
    } catch (error) {
      status.isError = true;
      status.reason = error;
    }
    ticket.close();
    if (status.isError) throw status.reason;
    return status.value as U;
  }

  public getTicket<T> (
    index?: T
  ): T extends number ? TaskSyncer | undefined : TaskSyncer {
    if (typeof index === 'number') return this.tickets[index];

    const number = this.tickets.length;
    const ticket = new TaskSyncer(this, number);

    this.tickets.push(ticket);
    ticket.ready.finally(() => { this.currentTicket = number; });
    return ticket;
  }

  private async getReady (index: number): Promise<void> {
    await new Promise((resolve, reject) => {
      this.done.finally(() => { reject(new Error('The syncer is already closed.')); });
      Promise.allSettled(this.tickets.slice(0, index - 1)).finally(() => { resolve(this.ready); });
    });
  }
}

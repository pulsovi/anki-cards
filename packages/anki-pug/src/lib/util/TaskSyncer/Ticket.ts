import { getDeferredPromise } from '../deferredPromise';
import type { DeferredPromise } from '../deferredPromise';

export default class Ticket {
  public readonly close: () => void;
  public readonly done: Promise<void>;
  public readonly ready: Promise<void>;

  private readonly number: number;

  public constructor (previous: Ticket | null, number: number) {
    this.number = number;
    this.ready = (previous ? previous.done : Promise.resolve()).finally();

    const deferredPromise: DeferredPromise<void> = getDeferredPromise();
    this.close = deferredPromise.resolve;
    this.done = deferredPromise.promise;
  }
}

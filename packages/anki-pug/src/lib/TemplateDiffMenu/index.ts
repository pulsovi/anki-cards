import { todo } from '../util';
import type { TaskSyncer } from '../util';

export default class TemplateDiffMenu {
  public async process (ticket: TaskSyncer): Promise<void> {
    await Promise.resolve(todo(this, ticket));
  }
}

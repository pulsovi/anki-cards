import type { Stats } from 'fs';

import chokidar from 'chokidar';

import { getLogger } from './debug';

type ChokidarEvent = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';

const log = getLogger('chokidarOnce');

export async function chokidarOnce (
  events: ChokidarEvent | ChokidarEvent[],
  files: string | readonly string[]
): Promise<[string, string, Stats] | [string, string]> {
  log(events, files);
  const eventList = Array.isArray(events) ? events : [events];
  const watcher = chokidar.watch(files);

  await new Promise(resolve => { watcher.once('ready', resolve); });
  // TODO: résoudre ce bug, faire un PR et un patch.
  if (eventList.includes('add'))
    await new Promise(resolve => { watcher.once('ready', resolve); });
  return await new Promise<[string, string, Stats] | [string, string]>((resolve, reject) => {
    eventList.forEach(event => {
      watcher.once(event, (path: string, stats?: Stats) => {
        resolve(stats ? [event, path, stats] : [event, path]);
      });
    });
    watcher.once('error', reject);
  }).then(value => {
    const [event, path] = value;
    log('fired', event, path);
    return value;
  }, reason => {
    log('thrown', reason);
    throw reason;
  }).finally(
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async () => { await watcher.close(); }
  );
}

import chokidar from 'chokidar';

export async function chokidarOnce (
  event: string | symbol,
  files: string | readonly string[]
): Promise<unknown> {
  const watcher = chokidar.watch(files);

  await new Promise(resolve => { watcher.once('ready', resolve); });
  return await new Promise((resolve, reject) => {
    watcher.once(event, resolve);
    watcher.once('error', reject);
  }).finally(
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async () => { await watcher.close(); }
  );
}

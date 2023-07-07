import childProcess from 'child_process';

/** Run single line command without watch on its result */
export function run (command: string): void {
  childProcess.spawn(command, { detached: true, shell: true, stdio: 'ignore' }).unref();
}

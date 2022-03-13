import chalk from 'chalk';

export function displayError (error: unknown): void {
  if (!(error instanceof Error)) {
    console.error(error);
    return;
  }
  console.error(
    `${chalk.red(error.name)}: ${chalk.yellow(error.message)}`,
    // do not (re)prompt first line : it's the error.message
    error.stack?.split('\n').map((line, id) => (id ? line : '')).join('\n')
  );
}

import 'core-js/actual/aggregate-error';
import chalk from 'chalk';

export function displayError (error: unknown): void {
  displayErrorWorker(error);
}

function displayErrorWorker (error: unknown, deep = 0): void {
  if (!(error instanceof Error)) {
    console.error(error);
    return;
  }
  console.error(
    `${'  '.repeat(deep)}${chalk.red(error.name)}: ${chalk.yellow(error.message)}`,
    // do not (re)prompt first line : it's the error.message
    error.stack?.split('\n').map((line, id) => (id ? `${'  '.repeat(deep)}${line}` : '')).join('\n')
  );
  if (error instanceof AggregateError)
    error.errors.forEach(subError => { displayErrorWorker(subError, deep + 1); });
}

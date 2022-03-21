import chalk from 'chalk';

import type ModuleLoader from '../ModuleLoader';

export function formatError (error: Error): string {
  return `${chalk.red(error.name)}: ${chalk.yellow(error.message)}`;
}

export function formatModule (modulePath: string, moduleName?: string): string;
export function formatModule<T> (moduleLoader: ModuleLoader<T>): string;
export function formatModule<T> (mdl: ModuleLoader<T> | string, name?: string): string {
  const { modulePath, moduleName } = parseModule(mdl, name);
  return `when attempt to load ${typeof moduleName === 'string' ?
    `"${moduleName}"(${chalk.yellow(modulePath)})` :
    chalk.yellow(modulePath)}`;
}

export function formatFiles (files: string[]): string {
  return `  Files watched:\n    ${files.map(file => chalk.cyanBright(file)).join('\n    ')}`;
}

function parseModule<T> (
  mdl: ModuleLoader<T> | string,
  name?: string
): ({ moduleName?: string; modulePath: string }) {
  if (typeof mdl === 'string')
    return { moduleName: name, modulePath: mdl };
  return { moduleName: mdl.getModuleName(), modulePath: mdl.getModulePath() };
}

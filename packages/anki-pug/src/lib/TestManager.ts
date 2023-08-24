import { glob } from 'glob';

import type { AnkiPugTestConfig } from '../bin/test-command';

import Test from './TestClass';

export default class TestManager {
  public readonly config: AnkiPugTestConfig;

  public constructor (config: AnkiPugTestConfig) {
    this.config = config;
  }

  /** Launch tests following this.config options */
  public async process (): Promise<void> {
    const testsToRun = await this.getTests();
    await Promise.all(testsToRun.map(async test => { await test.run(); }));
  }

  /** Return the list of the tests to run according to this.config  */
  private async getTests (): Promise<Test[]> {
    const allTests = await this.getAllTests();
    const testsToRun = allTests;
    return testsToRun;
  }

  /** Get all test available in the configured folder */
  private async getAllTests (): Promise<Test[]> {
    const { testsFolder } = this.config;
    const testFiles = await glob('**/*.test.json', { absolute: true, cwd: testsFolder, nodir: true });
    return await Promise.all(testFiles.map(async file => await Test.fromFile(file)));
  }
}

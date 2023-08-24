import fs from 'fs-extra';
import Joi from 'joi';

import { todo } from './util/todo';

interface RawTest {
  cid: string;
}

const rawTestSchema: Joi.Schema<RawTest> = Joi.object({
  cid: Joi.string().required(),
});

/** Represent one test */
export default class TestClass {
  public readonly cid: string;

  public constructor (raw: RawTest) {
    this.cid = raw.cid;
  }

  public static async fromFile (file: string): Promise<TestClass> {
    const content = await fs.readFile(file, 'utf8');
    const raw = Joi.attempt(JSON.parse(content), rawTestSchema);
    return new TestClass(raw);
  }

  public async run (): Promise<void> {
    await Promise.reject(todo(this));
  }
}

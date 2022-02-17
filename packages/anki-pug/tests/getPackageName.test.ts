import trueConfig from '../package';
import { getPackageName } from '../src/lib/util/getPackageName';

describe('getPackageName', () => {
  it('match to package.json name', () => {
    const { name: trueName } = trueConfig as { name: string };
    const name = getPackageName();

    expect(trueConfig).toHaveProperty('name');
    expect(name).toBe(trueName);
  });
});

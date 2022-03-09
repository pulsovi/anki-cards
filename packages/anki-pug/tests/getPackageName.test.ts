// eslint-disable-next-line import/extensions
import trueConfig from '../package.json';
import { getPackageName } from '../src/lib/util/getPackageName';

describe('getPackageName', () => {
  it('match to package.json name', () => {
    const trueName = trueConfig.name;
    const name = getPackageName();

    expect(trueConfig).toHaveProperty('name');
    expect(name).toBe(trueName);
  });
});

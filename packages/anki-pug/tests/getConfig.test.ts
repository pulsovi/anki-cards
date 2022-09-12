import path from 'path';

import getConfig from '../src/lib/getConfig';

describe('getConfig', () => {
  it('returns an object', () => {
    const config = getConfig({ ankiProfile: 'foo', modelsPath: './root/models' });
    expect(config).toBeObject();
  });

  it('throw an error on incorrect configuration', () => {
    expect(() => getConfig({ test: 'hello' })).toThrow();
  });

  it('does not cache earlier calls', () => {
    const first = getConfig({ ankiProfile: 'foo', modelsPath: 'foo' });
    getConfig({ ankiProfile: 'foo', modelsPath: 'foo', testsPath: 'boo' });
    expect(getConfig({ ankiProfile: 'foo', modelsPath: 'foo' })).toEqual(first);
  });

  it('process well relative paths', () => {
    const config = getConfig({
      ankiProfile: 'foo',
      configPath: `${__dirname}/.coucourc`,
      modelsPath: './foo/models',
    });
    expect(config.modelsPath).toBe(path.resolve(`${__dirname}/foo/models`));
  });

  it('requires ankiProfile', () => {
    expect(() => getConfig({ modelsPath: 'foo' })).toThrow();
  });
});

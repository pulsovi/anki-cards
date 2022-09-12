import getConfig from '../src/lib/getConfig';

describe('getConfig', () => {
  it('returns an object', () => {
    const config = getConfig({ modelsPath: './root/models' });
    expect(config).toBeObject();
  });

  it('throw an error on incorrect configuration', () => {
    expect(() => getConfig({ test: 'hello' })).toThrow();
  });

  it('does not cache earlier calls', () => {
    const first = getConfig({ modelsPath: 'foo' });
    getConfig({ ankiProfile: 'foo', modelsPath: 'foo' });
    expect(getConfig({ modelsPath: 'foo' })).toEqual(first);
  });
});

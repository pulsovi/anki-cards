import getConfig from '../src/lib/getConfig';

describe('getConfig', () => {
  it('returns an object', () => {
    const config = getConfig({ modelsPath: './root/models' });
    expect(config).toBeObject();
  });

  it('throw an error on incorrect configuration', () => {
    process.argv.push('--test="hello"');
    expect(() => getConfig()).toThrow();
  });
});

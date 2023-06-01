import AnkiConnect from '../src/AnkiConnect';
import type * as API from '../src/API';

test('error request close its ticket', async () => {
  const mock = AnkiConnect.prototype as unknown as { request: AnkiConnect['request'] };
  jest.spyOn(mock, 'request').mockImplementation(
    async <T extends API.BaseAPI>(parameters: API.RequestParameters<T>): Promise<unknown> => {
      const params = await Promise.resolve(parameters as unknown as API.AllAPI['request']);
      if (params.action === 'requestPermission') return { permission: 'granted' };
      if (params.action === 'modelStyling' && params.params.modelName === 'model1')
        throw new Error('crash');
      if (params.action === 'modelStyling' && params.params.modelName === 'model2')
        return { css: 'lol {}' };
      console.info({ parameters });
      return null;
    }
  );

  const connection = new AnkiConnect();
  await connection.getCSS({ modelName: 'model1' }).catch(_error => { /* do nothing */ });
  await expect(connection.getCSS({ modelName: 'model2' })).toResolve();
});

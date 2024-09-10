/*
 * https://github.com/FooSoft/anki-connect/blob/master/README.md
 * API: https://foosoft.net/projects/anki-connect/index.html
 */
import axios from 'axios';
import TaskSyncer from 'task-syncer';

import type * as API from './API.d';

export default class AnkiConnect {
  private readonly url: string;
  private readonly version: number;
  private readonly syncer = new TaskSyncer('root');

  public constructor (
    options: { version?: number } & ({ ip?: string; port?: number } | { url: string }) = {}
  ) {
    this.url = 'http://127.0.0.1:8765';
    this.version = 6;
    if ('url' in options) this.url = options.url;
    else if ('ip' in options)
      this.url = `http://${options.ip ?? '127.0.0.1'}:${options.port ?? 8765}`;
    if ('version' in options && options.version && options.version !== 6)
      throw new Error('This wrapper is only compatible with AnkiConnect version 6');
  }

  /**
   * Retrieves the Buffer contents of the specified file,
   * returning null if the file does not exist.
   */
  public async retrieveMediaFile (params: { filename: string }): Promise<Buffer | null> {
    const base64 = await this.requestAPI<API.MediaFileAPI>({ action: 'retrieveMediaFile', params });
    if (!base64) return null;
    return Buffer.from(base64, 'base64');
  }

  /** Get the template of one side of a model card */
  public async cardSideTemplates ({ cardName, side, modelName }: {
    modelName: string;
    cardName: string;
    side: 'Back' | 'Front';
  }): Promise<string> {
    const cardTemplates = await this.cardTemplates({ cardName, modelName });
    return cardTemplates[side];
  }

  public async getCSS (options: { modelName: string }): Promise<string> {
    return await this.modelStyling(options);
  }

  public async modelStyling ({ modelName }: { modelName: string }): Promise<string> {
    const response = await this.requestAPI<API.ModelStylingAPI>(
      { action: 'modelStyling', params: { modelName }}
    );
    return response.css;
  }

  /**
   * Modify the CSS styling of an existing model by name.
   */
  public async updateModelStyling (
    { modelName, css }: { modelName: string; css: string }
  ): Promise<void> {
    await this.requestAPI<API.UpdateModelStylingAPI>(
      { action: 'updateModelStyling', params: { model: { name: modelName, css }}}
    );
  }

  /**
   * Returns an object indicating the template content for the provided card by
   * name connected to the provided model by name.
   */
  public async cardTemplates ({ cardName, modelName }: {
    modelName: string;
    cardName: string;
  }): Promise<API.CardTemplate> {
    const modelTemplates = await this.modelTemplates({ modelName });
    if (cardName in modelTemplates) return modelTemplates[cardName];
    throw new Error(`Unable to find card "${cardName}" in model "${modelName}".`);
  }

  /**
   * Returns an object indicating the template content for each card connected
   * to the provided model by name.
   */
  public async modelTemplates (
    { modelName }: { modelName: string }
  ): Promise<API.ModelTemplates> {
    return await this.requestAPI<API.ModelTemplatesAPI>(
      { action: 'modelTemplates', params: { modelName }}
    );
  }

  /** Update all or part of templates of a model */
  public async updateModelTemplates ({ modelName, cards }: {
    modelName: string;
    cards: API.PartialModelTemplates;
  }): Promise<void> {
    await this.requestAPI<API.UpdateModelTemplatesAPI>({
      action: 'updateModelTemplates',
      params: { model: {
        name: modelName,
        templates: cards,
      }},
    });
  }

  /** Update the template of one side of a model card */
  public async updateCardSideTemplate (
    { modelName, cardName, side, value }: {
      modelName: string;
      cardName: string;
      side: 'Back' | 'Front';
      value: string;
    }
  ): Promise<void> {
    await this.updateModelTemplates({ modelName, cards: { [cardName]: { [side]: value }}});
  }

  private async requestAPI<T extends API.BaseAPI> (
    parameters: API.RequestParameters<T>
  ): Promise<API.RequestResult<T>> {
    if (parameters.action === 'requestPermission')
      throw new Error('Do not use "requestAPI" for "requestPermission", use "request" instead.');
    const response = await this.syncer.enqueue(async () => {
      const permission = await this.requestPermission();
      if (permission.permission === 'denied')
        throw new Error('AnkiConnect permission denied');
      if (permission.requireApikey)
        throw new Error('AnkiConnect Error; TODO: require API key');
      const result = await this.request<T>(parameters);
      return result;
    }, parameters.action);
    return response;
  }

  private async request<T extends API.BaseAPI> (
    parameters: API.RequestParameters<T>,
    attempts = 0
  ): Promise<API.RequestResult<T>> {
    const response = await axios
      .post(this.url, JSON.stringify({ ...parameters, version: this.version }), { timeout: 100000 })
      .catch((err: Error) => ({ data: { error: err }}));
    const { error, result } = response.data as API.RequestResponse<T>;

    if (error === null) return result;
    if (attempts < 3) return await this.request(parameters, attempts + 1);
    throw new Error(error);
  }

  private async requestPermission (): Promise<API.RequestResult<API.RequestPermissionAPI>> {
    return await this.request<API.RequestPermissionAPI>({ action: 'requestPermission' });
  }
}

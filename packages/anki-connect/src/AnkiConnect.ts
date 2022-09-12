// https://github.com/FooSoft/anki-connect/blob/master/README.md
import axios from 'axios';
import TaskSyncer from 'task-syncer';

import type {
  BaseAPI,
  CardTemplate,
  ModelTemplates,
  ModelTemplatesAPI,
  ModelStylingAPI,
  RequestParameters,
  RequestPermissionAPI,
  RequestResponse,
  RequestResult,
} from './API.d';
import { todo } from './util';

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

  public async cardFieldTemplates ({ cardName, field, modelName }: {
    modelName: string;
    cardName: string;
    field: 'Back' | 'Front';
  }): Promise<string> {
    const cardTemplates = await this.cardTemplates({ cardName, modelName });
    return cardTemplates[field];
  }

  public async getCSS (options: { modelName: string }): Promise<string> {
    return await this.modelStyling(options);
  }

  public async modelStyling ({ modelName }: { modelName: string }): Promise<string> {
    const response = await this.requestAPI<ModelStylingAPI>(
      { action: 'modelStyling', params: { modelName }}
    );
    return response.css;
  }

  public async cardTemplates ({ cardName, modelName }: {
    modelName: string;
    cardName: string;
  }): Promise<CardTemplate> {
    const modelTemplates = await this.modelTemplates({ modelName });
    if (cardName in modelTemplates) return modelTemplates[cardName];
    throw new Error(`Unable to find card "${cardName}" in model "${modelName}".`);
  }

  public async modelTemplates ({ modelName }: { modelName: string }): Promise<ModelTemplates> {
    return await this.requestAPI<ModelTemplatesAPI>(
      { action: 'modelTemplates', params: { modelName }}
    );
  }

  /** Update one side of one template in one model */
  public async updateModelTemplate (
    { modelName, templateName, side, value }: {
      modelName: string;
      templateName: string;
      side: 'Back' | 'Front';
      value: string;
    }
  ): Promise<void> {
    await Promise.resolve(todo({ modelName, templateName, side, value }, this));
    // AnkiConnect method: updateModelTemplates
  }

  private async requestAPI<T extends BaseAPI> (
    parameters: RequestParameters<T>
  ): Promise<RequestResult<T>> {
    if (parameters.action === 'requestPermission')
      throw new Error('Do not use "requestAPI" for "requestPermission", use "request" instead.');
    const ticket = this.syncer.getTicket(parameters.action);
    await ticket.ready;
    const permission = await this.requestPermission().catch(err => {
      ticket.close();
      throw err;
    });

    if (permission.permission === 'denied') {
      ticket.close();
      throw new Error('AnkiConnect permission denied');
    }
    if (permission.requireApikey) {
      ticket.close();
      return todo('AnkiConnect require API key') as RequestResult<T>;
    }

    const result = await this.request(parameters);
    ticket.close();
    return result;
  }

  private async request<T extends BaseAPI> (
    parameters: RequestParameters<T>
  ): Promise<RequestResult<T>> {
    const response = await axios
      .post(this.url, JSON.stringify({ ...parameters, version: this.version }))
      .catch((err: Error) => { throw new Error(err.message); });
    const { error, result } = response.data as RequestResponse<T>;

    if (error === null) return result;
    throw new Error(error);
  }

  private async requestPermission (): Promise<RequestResult<RequestPermissionAPI>> {
    return await this.request<RequestPermissionAPI>({ action: 'requestPermission' });
  }
}

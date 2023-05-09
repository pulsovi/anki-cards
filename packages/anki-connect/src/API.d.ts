export interface BaseAPI {
  request: {
    action: string;
    version?: number;
  };
  result: unknown;
}

export interface CardTemplate {
  /* eslint-disable @typescript-eslint/naming-convention */
  Front: string;
  Back: string;
  /* eslint-enable @typescript-eslint/naming-convention */
}

export interface ModelStylingAPI extends BaseAPI {
  request: {
    action: 'modelStyling';
    params: { modelName: string };
  };
  result: { css: string };
}

export interface RequestPermissionAPI extends BaseAPI {
  request: {
    action: 'requestPermission';
  };
  result: {
    permission: 'denied';
  } | {
    permission: 'granted';
    requireApikey: boolean;
    version: number;
  };
}

export type ModelTemplates = Record<string, CardTemplate>;

export interface ModelTemplatesAPI extends BaseAPI {
  request: {
    action: 'modelTemplates';
    params: {
      modelName: string;
    };
  };
  result: ModelTemplates;
}

export interface MediaFileAPI extends BaseAPI {
  request: {
    action: 'retrieveMediaFile';
    params: {
      filename: string;
    };
  };
  result: string;
}

export type AllAPI = ModelStylingAPI | ModelTemplatesAPI | RequestPermissionAPI;

export type APIType<T extends BaseAPI> = APITypeMapping[T['request']['action']];

export interface APITypeMapping {
  requestPermission: RequestPermissionAPI;
  modelStyling: ModelStylingAPI;
  modelTemplates: ModelTemplatesAPI;
}

export type RequestParameters<T extends BaseAPI> = T['request'];
export type RequestResponse<T extends BaseAPI> = {
  error: null;
  result: T['result'];
} | {
  error: string;
  result: null;
};
export type RequestResult<T extends BaseAPI> = T['result'];

export interface ErrorWithCode extends Error {
  code: string;
}

export interface BaseErrorManager {
  manage: () => Promise<boolean>;
}

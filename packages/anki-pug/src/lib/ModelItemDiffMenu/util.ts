export function isStringPair (data: unknown): data is [string, string] {
  return Array.isArray(data) && data.length === 2 && data.every(item => typeof item === 'string');
}

export function modelItemToString (data: Buffer | string | null): string {
  if (!data) return '';
  if (data instanceof Buffer) return data.toString();
  return data;
}

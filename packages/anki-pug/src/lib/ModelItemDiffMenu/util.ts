export function isStringPair (data: unknown): data is [string, string] {
  return Array.isArray(data) && data.length === 2 && data.every(item => typeof item === 'string');
}

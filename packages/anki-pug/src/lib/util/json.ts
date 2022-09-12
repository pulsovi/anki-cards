/** Return a copy of obj */
export function jsonClone<T> (obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

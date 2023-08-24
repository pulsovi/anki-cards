/**
 * Return a copy of obj
 *
 * @param skipError If true, any error will result to return the original object
 */
export function jsonClone<T> (obj: T, skipError = false): T {
  try {
    return JSON.parse(JSON.stringify(obj)) as T;
  } catch (error) {
    if (skipError) return obj;
    throw error;
  }
}

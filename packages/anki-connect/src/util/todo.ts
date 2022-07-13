export function todo (...args: unknown[]): unknown {
  if (typeof args[0] === 'string') console.info(args[0]);
  throw new Error("Cette route n'est pas encore construite.");
}

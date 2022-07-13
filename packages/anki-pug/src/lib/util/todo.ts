export function todo (...args: unknown[]): unknown {
  if (args[0]) console.info(args[0]);
  throw new Error("Cette route n'est pas encore construite.");
}

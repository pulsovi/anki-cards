export function requireUncache (moduleName: string): void {
  const resolved = require.resolve(moduleName);
  const moduleVal = require.cache[resolved];

  if (!moduleVal) return;
  const children = requireGetChildren(resolved);
  Reflect.deleteProperty(require.cache, resolved);
  children.forEach(child => { requireUncache(child); });
}

export function requireUncacheOnly (moduleNames: string[] | string): void {
  (Array.isArray(moduleNames) ? moduleNames : [moduleNames]).forEach(moduleName => {
    const resolved = require.resolve(moduleName);
    Reflect.deleteProperty(require.cache, resolved);
  });
}

export function requireGetChildren (moduleName: string): string[] {
  const moduleVal = requireGetCached(moduleName);
  if (!moduleVal) return [];
  const children: string[] = [];
  requirePushChildren(moduleVal, children);
  return children;
}

function requirePushChildren (moduleVal: NodeModule, children: string[]): void {
  const firstChildren = moduleVal.children;
  firstChildren.forEach(child => {
    if (children.includes(child.id)) return;
    children.push(child.id);
    requirePushChildren(child, children);
  });
}

export function requireGetCached (moduleName: string): NodeModule | undefined {
  const resolved = require.resolve(moduleName);
  return require.cache[resolved];
}

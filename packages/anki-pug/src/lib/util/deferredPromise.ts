export interface DeferredPromise<U> {
  promise: Promise<U>;
  reject: (reason?: unknown) => void;
  resolve: (value: U) => void;
}

export function getDeferredPromise<U> (): DeferredPromise<U> {
  const retVal: Partial<DeferredPromise<U>> = {};

  retVal.promise = new Promise((resolve, reject) => {
    retVal.resolve = resolve;
    retVal.reject = reject;
  });
  return retVal as DeferredPromise<U>;
}

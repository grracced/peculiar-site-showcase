import { AsyncLocalStorage } from 'node:async_hooks';

// AsyncLocalStorage allows us to trace context (like a Correlation ID)
// through asynchronous operations without passing it explicitly to every function.
export const contextStorage = new AsyncLocalStorage<Map<string, string>>();

export const getCorrelationId = (): string | undefined => {
  const store = contextStorage.getStore();
  return store?.get('correlationId');
};

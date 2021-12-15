export const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
};

export const withRetry = <P extends any[], R>(
  fn: (...args: P) => Promise<R> | R,
  maxRetries = 0,
  maxDelay = 5000
) => async (...args: P): Promise<R> => {
  let retries = 0;
  let delay = 2;
  let error = "";
  while (retries < maxRetries || maxRetries == 0) {
    try {
      return await fn(...args);
    } catch (e) {
      error = e as string;
      retries++;
      await sleep(delay);
      delay = Math.min(delay * 2, maxDelay);
    }
  }
  throw new Error(error);
};

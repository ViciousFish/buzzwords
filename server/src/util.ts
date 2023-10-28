import * as R from "ramda";
import { User } from "./types";

export const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
};

export const withRetry =
  <P extends any[], R>(
    fn: (...args: P) => Promise<R> | R,
    maxRetries = 0,
    maxDelay = 5000
  ) =>
  async (...args: P): Promise<R> => {
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

export const isAnonymousUser = (user: User): boolean => {
  return !user.googleId;
};

export const removeMongoId = <T>(thing: any): T => {
  // eslint-disable-line
  if (!R.is(Object, thing)) {
    return thing;
  } else if (R.is(Date, thing)) {
    // @ts-expect-error no clue lol
    return thing;
  } else if (Array.isArray(thing)) {
    return R.map(removeMongoId, thing) as unknown as T;
  } else {
    thing = R.dissoc("_id", thing);
    return R.map(removeMongoId, thing) as unknown as T;
  }
};

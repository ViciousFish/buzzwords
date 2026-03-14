import * as R from "ramda";

export type RNG = () => number;

/**
 * Creates a seeded pseudo-random number generator using the mulberry32 algorithm.
 * Use a constant seed in tests for deterministic behavior.
 * In production, seed with something like `Date.now()` or `Math.random() * 2**32`.
 */
export const createRNG = (seed: number): RNG => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export function* combinationN<T>(array: T[], n: number): Iterable<T[]> {
  if (n === 1) {
    for (const a of array) {
      yield [a];
    }
    return;
  }

  for (let i = 0; i <= array.length - n; i++) {
    for (const c of combinationN(array.slice(i + 1), n - 1)) {
      yield [array[i], ...c];
    }
  }
}

export function* permutationN<T>(array: T[], n: number): Iterable<T[]> {
  let data: T[] = [];
  let indecesUsed: boolean[] = [];
  yield* permutationUtil(0);
  function* permutationUtil(index: number): Iterable<T[]> {
    if (index === n) {
      return yield data.slice();
    }
    for (let i = 0; i < array.length; i++) {
      if (!indecesUsed[i]) {
        indecesUsed[i] = true;
        data[index] = array[i];
        yield* permutationUtil(index + 1);
        indecesUsed[i] = false;
      }
    }
  }
}

export const getRandomInt = (
  min: number,
  max: number,
  rng: RNG = Math.random
): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(rng() * (max - min) + min);
};

export const shuffle = <T>(arr: T[], rng: RNG = Math.random): T[] => {
  const a = R.clone(arr);
  for (let i = 0; i < a.length; i++) {
    const x = getRandomInt(0, a.length, rng);
    const tmp = a[i];
    a[i] = a[x];
    a[x] = tmp;
  }
  return a;
};

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

export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
};

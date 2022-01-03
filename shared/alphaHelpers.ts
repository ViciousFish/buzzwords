import * as R from "ramda";

const letters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const probabilities = [
  8.4966, 2.072, 4.5388, 3.3844, 11.1607, 1.8121, 2.4705, 3.0034, 7.5448,
  0.1965, 1.1016, 5.4893, 3.0129, 6.6544, 7.1635, 3.1671, 0.1962, 7.5809,
  5.7351, 6.9509, 3.6308, 1.0074, 1.2899, 0.2902, 1.7779, 0.2722,
].map((p) => p / 100);

let cdfArray: number[] = [];

let total = 0;
for (let p of probabilities) {
  total += p;
  cdfArray.push(total);
}

cdfArray = cdfArray.map((p) => Math.round(p * 100000) / 100000);

export const isValidWord = (
  word: string,
  words: {
    [key: string]: number;
  }
): boolean => {
  if (word.length < 3 || !Boolean(words[word.toLowerCase()])) {
    return false;
  }

  return true;
};

export const getRandomCharacter = (): string => {
  let n = Math.random();
  if (n > 0 && n < cdfArray[0]) {
    return letters[0];
  }
  for (let i = 0; i < cdfArray.length - 1; i++) {
    if (n > cdfArray[i] && n < cdfArray[i + 1]) {
      return letters[i + 1];
    }
  }
  return letters[letters.length - 1];
};

const vowels = ["a", "e", "i", "o", "u", "y"];

const combinations = <T>(a: T[], min?: number, max?: number): T[][] => {
  min = min ?? 0;
  max = max ?? a.length;
  min = min || 1;
  max = max < a.length ? max : a.length;
  var fn = function (n: number, src: any[], got: any[], all: any[]) {
    if (n == 0) {
      if (got.length > 0) {
        all[all.length] = got;
      }
      return;
    }
    for (var j = 0; j < src.length; j++) {
      fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
    }
    return;
  };
  var all: T[][] = [];
  for (var i = min; i < a.length; i++) {
    fn(i, a, [], all);
  }
  if (a.length == max) all.push(a);
  return all;
};

export const hasAVowel = (letters: string[]): boolean =>
  Boolean(letters.map((l) => vowels.includes(l)).filter(Boolean).length);

export const hasTwoConsonants = (letters: string[]): boolean =>
  letters.map((l) => !vowels.includes(l)).filter(Boolean).length >= 2;

export const getMaxRepeatedLetter = (letters: string[]): number => {
  // @ts-expect-error don't really know but it works
  return R.pipe(R.countBy(R.identity), R.values, R.apply(Math.max))(letters);
};

export const canMakeAValidWord = (
  letters: string[],
  wordsBySortedLetters: {
    [key: string]: number;
  }
): boolean => {
  for (let i = 3; i <= letters.length; i++) {
    const combos = R.uniq(combinations(letters, i, i).map((c) => c.join("")));
    for (let c of combos) {
      const sorted = R.sort(R.descend(R.identity), c.split(""));
      if (wordsBySortedLetters[sorted.join("")]) {
        return true;
      }
    }
  }
  return false;
};

import WordsJSON from "./words.json";

const words = Object.keys(WordsJSON);
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

export const isValidWord = (word: string): boolean => {
  if (word.length < 3 || !words.includes(word.toLowerCase())) {
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

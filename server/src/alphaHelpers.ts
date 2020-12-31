import WordsJSON from "../words.json";

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

export const isValidWord = (word: string): boolean => {
  if (word.length < 3 || !words.includes(word.toLowerCase())) {
    return false;
  }

  return true;
};

export const getRandomCharacter = (): string => {
  return letters[Math.floor(Math.random() * letters.length)];
};

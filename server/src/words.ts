import * as R from "ramda";
import WordsJSON from "../words.json";

const words = Object.keys(WordsJSON);
export const WordsObject: {
  [key: string]: number;
} = WordsJSON as unknown as { [key: string]: number };

const uniqSortedLetters = R.pipe(
  R.map(R.pipe(R.split(""), R.sort(R.descend(R.identity)), R.join(""))),
  R.uniq
)(words);
export const wordsBySortedLetters = R.zipObj(
  uniqSortedLetters,
  R.repeat(1, uniqSortedLetters.length)
);

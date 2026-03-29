/**
 * Test-only helper: loads the real game dictionaries from the server package.
 * Never import this file from production shared code.
 */
import * as R from "ramda";
import WordsJSON from "../server/words.json";
import BannedWordsJSON from "../server/src/banned_words.json";

export const WordsObject: { [key: string]: number } =
  WordsJSON as unknown as { [key: string]: number };

export const BannedWordsObject: { [key: string]: number } = R.zipObj(
  BannedWordsJSON,
  R.repeat(1, BannedWordsJSON.length)
);

const words = Object.keys(WordsObject);
const uniqSortedLetters = R.pipe(
  R.map(R.pipe(R.split(""), R.sort(R.descend(R.identity)), R.join(""))),
  R.uniq
)(words);
export const wordsBySortedLetters = R.zipObj(
  uniqSortedLetters,
  R.repeat(1, uniqSortedLetters.length)
);

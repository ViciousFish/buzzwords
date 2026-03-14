import { getRandomCharacter, isValidWord } from "buzzwords-shared/alphaHelpers";
import { getNewCellValues } from "buzzwords-shared/hexgrid";
import { createRNG, getRandomInt, shuffle } from "buzzwords-shared/utils";
import { WordsObject } from "./words";

const TEST_SEED = 12345;

test("should return a random character", () => {
  const char = getRandomCharacter();
  expect(typeof char).toBe("string");
  expect(char.length).toBe(1);

  expect(/^[a-z]$/.test(char)).toBe(true);
});

test("valid word must be at least 3 chars", () => {
  expect(isValidWord("ax", WordsObject)).toBeFalsy;
  expect(isValidWord("axe", WordsObject)).toBeTruthy;
});

test("valid word should take only chars", () => {
  expect(isValidWord("a123", WordsObject)).toBeFalsy;
});

test("getRandomCharacter with seeded RNG is deterministic", () => {
  const rng1 = createRNG(TEST_SEED);
  const rng2 = createRNG(TEST_SEED);
  expect(getRandomCharacter([], rng1)).toBe(getRandomCharacter([], rng2));
});

test("getRandomCharacter with seeded RNG produces valid letters", () => {
  const rng = createRNG(TEST_SEED);
  for (let i = 0; i < 20; i++) {
    const char = getRandomCharacter([], rng);
    expect(/^[a-z]$/.test(char)).toBe(true);
  }
});

test("getRandomCharacter respects omit list with seeded RNG", () => {
  const rng = createRNG(TEST_SEED);
  const omit = ["e", "t", "a", "o", "i", "n"];
  for (let i = 0; i < 20; i++) {
    const char = getRandomCharacter(omit, rng);
    expect(omit).not.toContain(char);
  }
});

test("shuffle with seeded RNG is deterministic", () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8];
  const rng1 = createRNG(TEST_SEED);
  const rng2 = createRNG(TEST_SEED);
  expect(shuffle(arr, rng1)).toEqual(shuffle(arr, rng2));
});

test("shuffle with seeded RNG contains all original elements", () => {
  const arr = ["a", "b", "c", "d", "e"];
  const rng = createRNG(TEST_SEED);
  const result = shuffle(arr, rng);
  expect(result.sort()).toEqual(arr.sort());
});

test("getRandomInt with seeded RNG is deterministic", () => {
  const rng1 = createRNG(TEST_SEED);
  const rng2 = createRNG(TEST_SEED);
  for (let i = 0; i < 10; i++) {
    expect(getRandomInt(0, 100, rng1)).toBe(getRandomInt(0, 100, rng2));
  }
});

test("getRandomInt with seeded RNG stays within bounds", () => {
  const rng = createRNG(TEST_SEED);
  for (let i = 0; i < 50; i++) {
    const n = getRandomInt(5, 15, rng);
    expect(n).toBeGreaterThanOrEqual(5);
    expect(n).toBeLessThan(15);
  }
});

test("getNewCellValues with seeded RNG is deterministic", () => {
  const rng1 = createRNG(TEST_SEED);
  const rng2 = createRNG(TEST_SEED);
  const result1 = getNewCellValues(["c", "a"], 2, WordsObject, rng1);
  const result2 = getNewCellValues(["c", "a"], 2, WordsObject, rng2);
  expect(result1).toEqual(result2);
});

test("getNewCellValues returns correct number of letters", () => {
  const rng = createRNG(TEST_SEED);
  const result = getNewCellValues(["c", "a"], 3, WordsObject, rng);
  expect(result).toHaveLength(3);
  result.forEach((letter) => {
    expect(/^[a-z]$/.test(letter)).toBe(true);
  });
});

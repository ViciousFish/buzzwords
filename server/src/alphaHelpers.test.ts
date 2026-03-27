import {
  getRandomCharacter,
  isValidWord,
  normalize,
  hasAVowel,
  hasTwoConsonants,
  getMaxRepeatedLetter,
  canMakeAValidWord,
} from "buzzwords-shared/alphaHelpers";
import { getNewCellValues } from "buzzwords-shared/hexgrid";
import { createRNG, restoreRNG, getRandomInt, shuffle } from "buzzwords-shared/utils";
import { WordsObject, wordsBySortedLetters } from "./words";

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

test("restoreRNG resumes sequence from saved state", () => {
  const rng = createRNG(TEST_SEED);
  // Advance past a few values
  rng();
  rng();
  rng();
  // Snapshot state, then record the next few values
  const state = rng.state();
  const v1 = rng();
  const v2 = rng();
  const v3 = rng();
  // Restore from snapshot and confirm the sequence repeats exactly
  const restored = restoreRNG(state);
  expect(restored()).toBe(v1);
  expect(restored()).toBe(v2);
  expect(restored()).toBe(v3);
});

test("getNewCellValues returns correct number of letters", () => {
  const rng = createRNG(TEST_SEED);
  const result = getNewCellValues(["c", "a"], 3, WordsObject, rng);
  expect(result).toHaveLength(3);
  result.forEach((letter) => {
    expect(/^[a-z]$/.test(letter)).toBe(true);
  });
});

// ─── normalize ────────────────────────────────────────────────────────────

describe("normalize", () => {
  it("maps a value at the midpoint of the source range to the midpoint of the target range", () => {
    expect(normalize(5, 0, 10, 0, 100)).toBe(50);
  });

  it("maps the minimum source value to the minimum target value", () => {
    expect(normalize(0, 0, 10, 0, 100)).toBe(0);
  });

  it("maps the maximum source value to the maximum target value", () => {
    expect(normalize(10, 0, 10, 0, 100)).toBe(100);
  });

  it("works with non-zero source and target minimums", () => {
    expect(normalize(5, 0, 10, 50, 150)).toBe(100);
  });

  it("works with a difficulty-to-word-length scenario (1–10 → 3–12)", () => {
    // difficulty 1 → word length 3
    expect(normalize(1, 1, 10, 3, 12)).toBeCloseTo(3, 5);
    // difficulty 10 → word length 12
    expect(normalize(10, 1, 10, 3, 12)).toBeCloseTo(12, 5);
  });
});

// ─── hasAVowel ────────────────────────────────────────────────────────────

describe("hasAVowel", () => {
  it("returns true for an array containing a vowel", () => {
    expect(hasAVowel(["b", "a", "t"])).toBe(true);
  });

  it("returns true for an array containing only vowels", () => {
    expect(hasAVowel(["a", "e", "i"])).toBe(true);
  });

  it("returns false for an array with no vowels", () => {
    expect(hasAVowel(["b", "c", "d"])).toBe(false);
  });

  it("returns false for an empty array", () => {
    expect(hasAVowel([])).toBe(false);
  });

  it("treats y as a vowel", () => {
    expect(hasAVowel(["b", "y"])).toBe(true);
  });
});

// ─── hasTwoConsonants ─────────────────────────────────────────────────────

describe("hasTwoConsonants", () => {
  it("returns true when there are at least two consonants", () => {
    expect(hasTwoConsonants(["b", "c", "a"])).toBe(true);
  });

  it("returns true for exactly two consonants", () => {
    expect(hasTwoConsonants(["b", "c"])).toBe(true);
  });

  it("returns false for fewer than two consonants", () => {
    expect(hasTwoConsonants(["b", "a", "e"])).toBe(false);
  });

  it("returns false for an all-vowel array", () => {
    expect(hasTwoConsonants(["a", "e", "i", "o"])).toBe(false);
  });

  it("returns false for an empty array", () => {
    expect(hasTwoConsonants([])).toBe(false);
  });
});

// ─── getMaxRepeatedLetter ─────────────────────────────────────────────────

describe("getMaxRepeatedLetter", () => {
  it("returns 1 when all letters are unique", () => {
    expect(getMaxRepeatedLetter(["a", "b", "c"])).toBe(1);
  });

  it("returns the correct count for the most-repeated letter", () => {
    expect(getMaxRepeatedLetter(["a", "a", "a", "b"])).toBe(3);
  });

  it("returns 2 when one letter appears twice", () => {
    expect(getMaxRepeatedLetter(["a", "a", "b", "c"])).toBe(2);
  });

  it("handles a single-element array", () => {
    expect(getMaxRepeatedLetter(["z"])).toBe(1);
  });

  it("handles all identical letters", () => {
    expect(getMaxRepeatedLetter(["e", "e", "e", "e"])).toBe(4);
  });
});

// ─── canMakeAValidWord ────────────────────────────────────────────────────

describe("canMakeAValidWord", () => {
  it("returns true when valid 3-letter word can be formed", () => {
    // 'cat' is a valid word — sorted descending: t,c,a → "tca"
    expect(canMakeAValidWord(["c", "a", "t"], wordsBySortedLetters)).toBe(true);
  });

  it("returns true when valid word can be formed from a subset of letters", () => {
    // Extra letters beyond the word are fine
    expect(canMakeAValidWord(["c", "a", "t", "z", "x"], wordsBySortedLetters)).toBe(true);
  });

  it("returns false when no valid word can be formed", () => {
    // "zzz" is unlikely to be a real word
    expect(canMakeAValidWord(["z", "z", "z"], wordsBySortedLetters)).toBe(false);
  });

  it("returns false when fewer than 3 letters are provided", () => {
    expect(canMakeAValidWord(["a", "b"], wordsBySortedLetters)).toBe(false);
  });

  it("returns false for an empty array", () => {
    expect(canMakeAValidWord([], wordsBySortedLetters)).toBe(false);
  });

  it("returns true for a common 4-letter word", () => {
    expect(canMakeAValidWord(["w", "o", "r", "d"], wordsBySortedLetters)).toBe(true);
  });
});

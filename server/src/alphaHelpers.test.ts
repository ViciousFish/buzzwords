import { getRandomCharacter, isValidWord } from "buzzwords-shared/alphaHelpers";

test("should return a random character", () => {
  const char = getRandomCharacter();
  expect(typeof char).toBe("string");
  expect(char.length).toBe(1);

  expect(/^[a-z]$/.test(char)).toBe(true);
});

test("valid word must be at least 3 chars", () => {
  expect(isValidWord("ax")).toBeFalsy;
  expect(isValidWord("axe")).toBeTruthy;
});

test("valid word should take only chars", () => {
  expect(isValidWord("a123")).toBeFalsy;
});

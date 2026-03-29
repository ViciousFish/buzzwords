import { combinationN, permutationN } from "./utils";

// ─── combinationN ─────────────────────────────────────────────────────────

describe("combinationN", () => {
  it("generates all 1-element combinations", () => {
    const result = [...combinationN([1, 2, 3], 1)];
    expect(result).toEqual([[1], [2], [3]]);
  });

  it("generates all 2-element combinations from a 3-element array", () => {
    const result = [...combinationN([1, 2, 3], 2)];
    expect(result).toEqual([[1, 2], [1, 3], [2, 3]]);
  });

  it("generates all 3-element combinations from a 4-element array (C(4,3)=4)", () => {
    const result = [...combinationN([1, 2, 3, 4], 3)];
    expect(result).toHaveLength(4);
    // Each combination should have 3 elements
    result.forEach((c) => expect(c).toHaveLength(3));
    // Elements should be in ascending index order (no repeats)
    expect(result).toContainEqual([1, 2, 3]);
    expect(result).toContainEqual([1, 2, 4]);
    expect(result).toContainEqual([1, 3, 4]);
    expect(result).toContainEqual([2, 3, 4]);
  });

  it("generates exactly C(n,k) combinations", () => {
    // C(5,2) = 10
    const result = [...combinationN([1, 2, 3, 4, 5], 2)];
    expect(result).toHaveLength(10);
  });

  it("generates 1 combination when k equals array length", () => {
    const result = [...combinationN([1, 2, 3], 3)];
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual([1, 2, 3]);
  });

  it("generates 0 combinations when k exceeds array length", () => {
    const result = [...combinationN([1, 2], 3)];
    expect(result).toHaveLength(0);
  });

  it("works with string arrays", () => {
    const result = [...combinationN(["a", "b", "c"], 2)];
    expect(result).toContainEqual(["a", "b"]);
    expect(result).toContainEqual(["a", "c"]);
    expect(result).toContainEqual(["b", "c"]);
  });

  it("no combination contains duplicate elements (same index)", () => {
    const result = [...combinationN([1, 2, 3, 4], 2)];
    for (const combo of result) {
      expect(new Set(combo).size).toBe(combo.length);
    }
  });
});

// ─── permutationN ─────────────────────────────────────────────────────────

describe("permutationN", () => {
  it("generates all 1-element permutations", () => {
    const result = [...permutationN([1, 2, 3], 1)];
    expect(result).toHaveLength(3);
    expect(result).toContainEqual([1]);
    expect(result).toContainEqual([2]);
    expect(result).toContainEqual([3]);
  });

  it("generates all 2-element permutations from a 3-element array (P(3,2)=6)", () => {
    const result = [...permutationN([1, 2, 3], 2)];
    expect(result).toHaveLength(6);
    expect(result).toContainEqual([1, 2]);
    expect(result).toContainEqual([2, 1]);
    expect(result).toContainEqual([1, 3]);
    expect(result).toContainEqual([3, 1]);
    expect(result).toContainEqual([2, 3]);
    expect(result).toContainEqual([3, 2]);
  });

  it("generates n! permutations when k equals array length", () => {
    // P(3,3) = 3! = 6
    const result = [...permutationN([1, 2, 3], 3)];
    expect(result).toHaveLength(6);
    // All elements should appear in every permutation
    result.forEach((p) => {
      expect(p.sort()).toEqual([1, 2, 3]);
    });
  });

  it("generates exactly P(n,k) = n!/(n-k)! permutations", () => {
    // P(4,2) = 4*3 = 12
    const result = [...permutationN([1, 2, 3, 4], 2)];
    expect(result).toHaveLength(12);
  });

  it("no permutation contains duplicate indices", () => {
    const result = [...permutationN([1, 2, 3], 2)];
    for (const perm of result) {
      expect(new Set(perm).size).toBe(perm.length);
    }
  });

  it("works with string arrays", () => {
    const result = [...permutationN(["a", "b"], 2)];
    expect(result).toContainEqual(["a", "b"]);
    expect(result).toContainEqual(["b", "a"]);
  });
});

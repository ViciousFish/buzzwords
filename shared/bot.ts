import HexGrid from "./hexgrid";
import Game from "./Game";

import { combinationN, getRandomInt } from "./utils";
import { isValidWord } from "./alphaHelpers";
import { HexCoord } from "./types";

export const getBotMove = (
  grid: HexGrid,
  options: {
    difficulty: number;
    words: {
      [key: string]: number;
    };
  }
): HexCoord[] => {
  const openTiles = Object.values(grid).filter((cell) => {
    return cell.owner == 2 && cell.value != "";
  });

  const jitter = getRandomInt(-3, 4);

  // Bound max length between 3 and total open tiles
  const maxWordLength = Math.max(
    Math.min(openTiles.length, options.difficulty + jitter),
    3
  );

  for (let i = maxWordLength; i >= 3; i--) {
    for (let c of combinationN(openTiles, i)) {
      if (isValidWord(c.map((c) => c.value).join(""), options.words)) {
        return c.map((c) => ({
          q: c.q,
          r: c.r,
        }));
      }
    }
  }
  throw "No valid combinations! This shouldn't be possible";
};

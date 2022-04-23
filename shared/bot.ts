import * as R from "ramda";

import HexGrid, { getCellNeighbors } from "./hexgrid";

import { getRandomInt, shuffle } from "./utils";
import { normalize } from "./alphaHelpers";
import { HexCoord } from "./types";

export const getBotMove = (
  grid: HexGrid,
  options: {
    difficulty: number;
    words: {
      [key: string]: number;
    };
    bannedWords: {
      [key: string]: number;
    };
  }
): HexCoord[] => {
  const openTiles = Object.values(grid).filter((cell) => {
    return !cell.capital && cell.owner == 2 && cell.value != "";
  });

  const botCapital = Object.values(grid).find((c) => c.owner == 1 && c.capital);
  if (!botCapital) {
    throw "Bot doesn't have capital on its own turn. Shouldn't be possible!";
  }

  const capitalNeighbors = shuffle(
    getCellNeighbors(grid, botCapital.q, botCapital.r).filter(
      (c) => c.owner == 2
    )
  );

  const nonCapitalNeighbors = shuffle(
    Object.values(grid)
      .filter(
        (cell) =>
          getCellNeighbors(grid, cell.q, cell.r)
            .map((c) => c.owner)
            .includes(1) &&
          cell.owner == 2 &&
          !cell.capital &&
          cell.value != ""
      )
      .filter(
        (cell) =>
          !getCellNeighbors(grid, cell.q, cell.r)
            .map((c) => c.capital && Boolean(c.owner))
            .includes(true)
      )
  );

  const capitalNeighborCoords = capitalNeighbors.map((c) => `${c.q},${c.r}`);
  const nonCapitalNeighborCoords = nonCapitalNeighbors.map(
    (c) => `${c.q},${c.r}`
  );

  const nonNeighborTiles = shuffle(
    openTiles.filter(
      (c) =>
        !capitalNeighborCoords.includes(`${c.q},${c.r}`) &&
        !nonCapitalNeighborCoords.includes(`${c.q},${c.r}`)
    )
  );
  const nonNeighborCoords = nonNeighborTiles.map((c) => `${c.q},${c.r}`);

  const possibleWordsToScore: {
    [key: string]: { score: number; move: HexCoord[]; word: string };
  } = {};

  const coordTypes = [
    nonNeighborCoords,
    nonCapitalNeighborCoords,
    capitalNeighborCoords,
  ];

  for (const word of Object.keys(options.words)) {
    if (word.length < 3) {
      continue;
    }
    const tiles = [
      ...capitalNeighbors,
      ...nonCapitalNeighbors,
      ...nonNeighborTiles,
    ];
    let valid = true;
    let score = 1;
    let move: HexCoord[] = [];
    for (let letter of word.split("")) {
      const idx = tiles.findIndex((cell) => cell.value === letter);
      if (idx === -1) {
        valid = false;
        break;
      }
      score++;
      const coord = `${tiles[idx].q},${tiles[idx].r}`;
      for (let i = 0; i < coordTypes.length; i++) {
        if (coordTypes[i].includes(coord)) {
          score *= Math.pow(10, i);
          break;
        }
      }

      move.push({ q: tiles[idx].q, r: tiles[idx].r });
      tiles.splice(idx, 1);
    }
    if (valid) {
      possibleWordsToScore[word] = { score, move, word };
    }
  }

  const wordScoresByWordLength: {
    score: number;
    move: HexCoord[];
    word: string;
  }[][] = [];
  for (let i = 3; i <= openTiles.length; i++) {
    wordScoresByWordLength[i - 3] = [];
  }
  for (let wordInfo of Object.values(possibleWordsToScore)) {
    wordScoresByWordLength[wordInfo.word.length - 3].push(wordInfo);
  }

  const jitter = getRandomInt(-1, 2);

  const maxWordLength = R.clamp(
    3,
    openTiles.length,
    Math.floor(
      normalize(
        options.difficulty + jitter,
        1,
        10,
        3,
        Math.min(openTiles.length, 12)
      )
    ) - 2
  );
  for (let i = maxWordLength; i >= 3; i--) {
    let words = wordScoresByWordLength[i - 3];
    if (!words.length) {
      continue;
    }
    const sortedWordScores = wordScoresByWordLength[i - 3].sort(
      (a, b) => a.score - b.score
    );
    const word =
      sortedWordScores[
        sortedWordScores.length -
          getRandomInt(1, Math.min(sortedWordScores.length, 5))
      ];

    return word.move;
  }

  throw "Shouldn't get here ever";
};

import type { AiEnumerate, Game as BoardGame, Move } from "boardgame.io";
import { Buzzwords, BuzzwordsGameState } from "./Buzzwords";
import { nanoid } from "nanoid";
import HexGrid from "./hexgrid";
import * as R from "ramda";

export const tutorialInitialBoard: HexGrid = {
  "-3,-1": {
    "q": -3,
    "r": -1,
    "capital": false,
    "owner": 2,
    "value": "s"
  },
  "-3,0": {
    "q": -3,
    "r": 0,
    "capital": false,
    "owner": 2,
    "value": "o"
  },
  "-3,1": {
    "q": -3,
    "r": 1,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "-3,2": {
    "q": -3,
    "r": 2,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "-3,3": {
    "q": -3,
    "r": 3,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "-3,4": {
    "q": -3,
    "r": 4,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "-2,-2": {
    "q": -2,
    "r": -2,
    "capital": false,
    "owner": 2,
    "value": "h"
  },
  "-2,-1": {
    "q": -2,
    "r": -1,
    "capital": true,
    "owner": 0,
    "value": ""
  },
  "-2,0": {
    "q": -2,
    "r": 0,
    "capital": false,
    "owner": 2,
    "value": "l"
  },
  "-2,1": {
    "q": -2,
    "r": 1,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "-2,2": {
    "q": -2,
    "r": 2,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "-2,3": {
    "q": -2,
    "r": 3,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "-2,4": {
    "q": -2,
    "r": 4,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "-1,-2": {
    "q": -1,
    "r": -2,
    "capital": false,
    "owner": 2,
    "value": "e"
  },
  "-1,-1": {
    "q": -1,
    "r": -1,
    "capital": false,
    "owner": 2,
    "value": "l"
  },
  "-1,0": {
    "q": -1,
    "r": 0,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "-1,1": {
    "q": -1,
    "r": 1,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "-1,2": {
    "q": -1,
    "r": 2,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "-1,3": {
    "q": -1,
    "r": 3,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "0,-3": {
    "q": 0,
    "r": -3,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "0,-2": {
    "q": 0,
    "r": -2,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "0,-1": {
    "q": 0,
    "r": -1,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "0,0": {
    "q": 0,
    "r": 0,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "0,1": {
    "q": 0,
    "r": 1,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "0,2": {
    "q": 0,
    "r": 2,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "0,3": {
    "q": 0,
    "r": 3,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "1,-3": {
    "q": 1,
    "r": -3,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "1,-2": {
    "q": 1,
    "r": -2,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "1,-1": {
    "q": 1,
    "r": -1,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "1,0": {
    "q": 1,
    "r": 0,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "1,1": {
    "q": 1,
    "r": 1,
    "capital": false,
    "owner": 2,
    "value": "h"
  },
  "1,2": {
    "q": 1,
    "r": 2,
    "capital": false,
    "owner": 2,
    "value": "l"
  },
  "2,-4": {
    "q": 2,
    "r": -4,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "2,-3": {
    "q": 2,
    "r": -3,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "2,-2": {
    "q": 2,
    "r": -2,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "2,-1": {
    "q": 2,
    "r": -1,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "2,0": {
    "q": 2,
    "r": 0,
    "capital": false,
    "owner": 2,
    "value": "i"
  },
  "2,1": {
    "q": 2,
    "r": 1,
    "capital": true,
    "owner": 1,
    "value": ""
  },
  "2,2": {
    "q": 2,
    "r": 2,
    "capital": false,
    "owner": 2,
    "value": "e"
  },
  "3,-4": {
    "q": 3,
    "r": -4,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "3,-3": {
    "q": 3,
    "r": -3,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "3,-2": {
    "q": 3,
    "r": -2,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "3,-1": {
    "q": 3,
    "r": -1,
    "capital": false,
    "owner": 2,
    "value": ""
  },
  "3,0": {
    "q": 3,
    "r": 0,
    "capital": false,
    "owner": 2,
    "value": "w"
  },
  "3,1": {
    "q": 3,
    "r": 1,
    "capital": false,
    "owner": 2,
    "value": "t"
  },
};

export const TutorialBuzzwords: BoardGame<BuzzwordsGameState> = {
  ...Buzzwords,
  setup: ({ ctx, ...plugins }, setupData) => {
    const game: BuzzwordsGameState = {
      id: nanoid(),
      grid: R.clone(tutorialInitialBoard),
    };
    // const neighbors = [
    //   ...getCellNeighbors(game.grid, -2, -1),
    //   ...getCellNeighbors(game.grid, 2, 1),
    // ];
    // const newValues = getNewCellValues([], 12, WordsObject);
    // let i = 0;
    // for (const cell of neighbors) {
    //   cell.value = newValues[i];
    //   i++;
    //   game.grid = setCell(game.grid, cell);
    // }
    game.grid["-2,-1"].capital = true;
    game.grid["-2,-1"].owner = 0;
    game.grid["2,1"].capital = true;
    game.grid["2,1"].owner = 1;
    return game;
  },
};

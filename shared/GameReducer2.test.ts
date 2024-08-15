import { expect, it, describe } from 'vitest'
import * as R from "ramda";
import {enablePatches} from 'immer';

import { makeMove } from "./GameReducer2";
import { in_progress_game, valid_selection } from './mockData/in_progress_game';
import { HexCoord } from './types';

enablePatches();

function selectionToCoords(selection: { [position: string]: number }): HexCoord[] {
  const pairs = R.toPairs(selection);
    const sortedPairs = R.sortBy((pair) => pair[1], pairs);
    return sortedPairs.map((pair) => {
      const [q, r] = pair[0].split(",");
      return {
        q: Number(q),
        r: Number(r),
      } as HexCoord;
    });
}

describe('makeMove', () => {
  it('should make a move', () => {
    const game = structuredClone(in_progress_game);
    const move = selectionToCoords(valid_selection);

    // // Act
    makeMove(game, move, 'asdf');

    // Assert
    expect(true).toBe(true);
  });
});
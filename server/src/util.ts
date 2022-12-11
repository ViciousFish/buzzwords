import {
  Game as PrismaGame,
  GameUser,
  Cell as PrismaCell,
  MoveCoord,
  Move as PrismaMove,
  User as PrismaUser,
} from "@prisma/client";
import Game, { Move } from "buzzwords-shared/Game";
import HexGrid from "buzzwords-shared/hexgrid";
import { HexCoord } from "buzzwords-shared/types";
import * as R from "ramda";
import { User } from "./types";

type stuff = PrismaGame & {
  users: (GameUser & {
    user: PrismaUser;
  })[];
  moves: (PrismaMove & {
    cells: PrismaCell[];
    coords: MoveCoord[];
  })[];
  cells: PrismaCell[];
};

export const prismaCellsToHexGrid = (cells: PrismaCell[]): HexGrid => {
  const grid: HexGrid = {};
  for (const cell of cells) {
    grid[`${cell.q},${cell.r}`] = {
      q: cell.q,
      r: cell.r,
      capital: cell.capital,
      owner: cell.owner as 0 | 1 | 2,
      value: cell.value,
    };
  }
  return grid;
};

export const prismaGameToAPIGame = (prismaGame: stuff): Game => {
  const moves = prismaGame.moves.map((m) => {
    const coords: HexCoord[] = [];
    for (const coord of m.coords) {
      coords[coord.index] = {
        q: coord.q,
        r: coord.r,
      };
    }
    const grid = prismaCellsToHexGrid(m.cells);

    const player = prismaGame.users.find((u) => u.user_id === m.user_id)
      ?.player_number as 0 | 1;

    const move: Move = {
      grid,
      coords,
      letters: m.word?.split("") ?? [],
      player,
      date: m.date,
      shuffle: m.shuffle,
      pass: m.pass,
      forfeit: m.forfeit,
    };
    return move;
  });

  const game: Game = {
    id: prismaGame.id,
    users: prismaGame.users
      .sort((a, b) => a.player_number - b.player_number)
      .map((u) => u.user_id),
    vsAI: prismaGame.vs_ai,
    difficulty: prismaGame.difficulty,
    turn: prismaGame.turn as 0 | 1,
    grid: prismaCellsToHexGrid(prismaGame.cells),
    gameOver: prismaGame.game_over,
    winner: prismaGame.winner as 0 | 1 | null,
    moves,
    createdDate: prismaGame.createdDate,
    deleted: prismaGame.deleted,
  };

  return game;
};

export const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
};

export const withRetry =
  <P extends any[], R>(
    fn: (...args: P) => Promise<R> | R,
    maxRetries = 0,
    maxDelay = 5000
  ) =>
  async (...args: P): Promise<R> => {
    let retries = 0;
    let delay = 2;
    let error = "";
    while (retries < maxRetries || maxRetries == 0) {
      try {
        return await fn(...args);
      } catch (e) {
        error = e as string;
        retries++;
        await sleep(delay);
        delay = Math.min(delay * 2, maxDelay);
      }
    }
    throw new Error(error);
  };

export const isAnonymousUser = (user: User): boolean => {
  return !user.googleId;
};

export const removeMongoId = <T>(thing: any): T => {
  // eslint-disable-line
  if (!R.is(Object, thing)) {
    return thing;
  } else if (R.is(Date, thing)) {
    // @ts-expect-error no clue lol
    return thing;
  } else if (Array.isArray(thing)) {
    return R.map(removeMongoId, thing) as unknown as T;
  } else {
    thing = R.dissoc("_id", thing);
    return R.map(removeMongoId, thing) as unknown as T;
  }
};

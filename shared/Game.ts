import HexGrid from "./hexgrid";
import { HexCoord } from "./types";

export interface Move {
  grid: HexGrid;
  coords: HexCoord[];
  letters: string[];
  player: 0 | 1;
  startedAt?: Date; // when the player started this turn
  date?: Date;      // when the move was submitted
  shuffle?: boolean;
  pass?: boolean;
  forfeit?: boolean;
  timeout?: boolean;
}

export interface TimerConfig {
  timePerPlayer: number; // total milliseconds for the whole game
}

export default interface Game {
  id: string;
  users: string[];
  vsAI: boolean;
  difficulty: number;
  turn: 0 | 1;
  grid: HexGrid;
  gameOver: boolean;
  winner: 0 | 1 | null;
  moves: Move[];
  createdDate?: Date;
  updatedDate?: Date;
  deleted: boolean;
  timerConfig?: TimerConfig;
  timeRemaining?: [number, number]; // ms remaining per player [p0, p1]
  timerStartedAt?: number | null;   // ms epoch when current turn timer was started; null = not started
}

export type ShallowGame = Omit<Game, "moves" | "grid">;

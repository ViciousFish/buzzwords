import Cell from "buzzwords-shared/cell";
import HexGrid from "buzzwords-shared/hexgrid";
import { HexCoord } from "buzzwords-shared/types";

export interface EndlessCell extends Cell {
  createdTurn: number;
}

/** HexGrid type for Endless mode
 * not a spatially infinite grid */
export interface EndlessHexGrid {
  [key: string]: EndlessCell;
}

type EndlessMoveAccolade = "longest-word" | "highest-scoring" | "previous-move" | "final-move";

export interface EndlessMove {
  grid: EndlessHexGrid;
  coords: HexCoord[];
  letters: string[];
  turnNumber: number;
  accolade: EndlessMoveAccolade;
}

export interface EndlessGame {
  grid: EndlessHexGrid;
  turn: number;
  // gameState: "playable" | "ended";
  score: number;
  accoladeMoves: Record<EndlessMoveAccolade, EndlessMove | null>;
}
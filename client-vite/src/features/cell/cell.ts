import { GamePlayer } from "../game/game";
import {getRandomCharacter} from "../../../../shared/alphaHelpers";
export interface Cell {
  q: number;
  r: number;
  value: string;
  capital: boolean;
  owner: GamePlayer;
  active: boolean;
}

export const getEmptyCell = (q, r): Cell => ({
  q,
  r,
  value: "",
  capital: false,
  owner:  GamePlayer.Nobody,
  active: false
})

export const getActivatedCell = (cell: Cell): Cell => ({
  ...cell,
  active: true,
  value: getRandomCharacter()
})
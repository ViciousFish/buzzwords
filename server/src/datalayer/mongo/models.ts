import { model, Schema } from "mongoose";

import Game from "buzzwords-shared/Game";

const gameSchema = new Schema<Game>({
  id: {
    type: String,
    required: true,
  },
  users: {
    type: [String],
    index: true,
    required: true,
  },
  turn: {
    type: Number,
    required: true,
  },
  grid: {
    type: Map,
    of: {
      q: Number,
      r: Number,
      value: String,
      capital: Boolean,
      owner: Number,
    },
  },
  gameOver: {
    type: Boolean,
    required: true,
  },
  winner: {
    type: Number,
  },
  moves: [
    {
      player: Number,
      letters: [String],
      coords: [{ q: Number, r: Number }],
    },
  ],
});

const GameModel = model<Game>("Game", gameSchema);

export default {
  Game: GameModel,
};

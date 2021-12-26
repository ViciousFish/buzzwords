import { model, Schema, Model, Document } from "mongoose";

import Cell from "buzzwords-shared/cell";

interface UserDocument extends Document {
  ulid: string;
}

type UserModel = Model<UserDocument>;
const UserSchema: Schema<UserDocument, UserModel> = new Schema<
  UserDocument,
  UserModel
>({
  ulid: { type: String, required: true, index: true },
});

const User = model("User", UserSchema);

interface GameDocument extends Document {
  ulid: string;
  users: string[];
  turn: 0 | 1;
  grid: Cell[];
}

type GameModel = Model<GameDocument>;

const GameSchema: Schema<GameDocument, GameModel> = new Schema<
  GameDocument,
  GameModel
>({
  ulid: { type: String, required: true, index: true },
  users: { type: [String], index: true },
  turn: { type: Number, required: true },
  grid: [
    {
      q: Number,
      r: Number,
      value: String,
      capital: Boolean,
      owner: Number,
      active: Boolean,
    },
  ],
  gameOver: { type: Boolean, required: true },
  winner: { type: Number },
});

const Game = model("Game", GameSchema);

export default {
  User,
  Game,
};

import { model, Schema } from "mongoose";

import { User, AuthToken } from "../../types";

import Game from "buzzwords-shared/Game";

const gameSchema = new Schema<Game>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  users: {
    type: [{ type: String, index: true }],
    index: true,
    required: true,
  },
  turn: {
    type: Number,
    required: true,
  },
  grid: {
    type: Map,
    _id: false,
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
  deleted: {
    type: Boolean,
    required: true,
    default: false,
    index: true,
  },
  winner: {
    type: Number,
  },
  moves: [
    {
      player: Number,
      letters: [String],
      coords: [{ q: Number, r: Number }],
      grid: {
        type: Map,
        of: {
          q: Number,
          r: Number,
          value: String,
          capital: Boolean,
          owner: Number,
        },
        _id: false,
      },
      date: {
        type: Date,
        required: true,
        default: () => new Date(),
      },
      _id: false,
    },
  ],
  vsAI: {
    type: Boolean,
    required: true,
  },
  difficulty: {
    type: Number,
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
  updatedDate: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
});

const GameModel = model<Game>("Game", gameSchema);

const userSchema = new Schema<User>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  nickname: {
    type: String,
  },
  googleId: {
    type: String,
  },
});

const UserModel = model<User>("User", userSchema);

const authTokenSchema = new Schema<AuthToken>({
  token: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
  deleted: {
    type: Boolean,
    default: () => false,
  },
  state: {
    type: String,
    index: true,
  },
});

const AuthTokenModel = model<AuthToken>("AuthToken", authTokenSchema);

const migrationSchema = new Schema<{ version: number }>(
  {
    version: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const MigrationModel = model<{ version: number }>("Migration", migrationSchema);

export default {
  Game: GameModel,
  User: UserModel,
  AuthToken: AuthTokenModel,
  Migration: MigrationModel,
};

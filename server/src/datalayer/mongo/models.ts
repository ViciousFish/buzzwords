import { model, Schema } from "mongoose";

import Game from "buzzwords-shared/Game";
interface User {
  id: string;
  nickname: string;
}

interface AuthToken {
  token: string;
  userId: string;
  createdDate: Date;
}

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
      date: {
        type: Date,
        required: true,
        default: () => new Date(),
      },
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
  },
  nickname: {
    type: String,
    required: true,
  },
});

const UserModel = model<User>("User", userSchema);

const authTokenSchema = new Schema<AuthToken>({
  token: {
    type: String,
    required: true,
    index: true,
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
});

const AuthTokenModel = model<AuthToken>("AuthToken", authTokenSchema);

export default {
  Game: GameModel,
  User: UserModel,
  AuthToken: AuthTokenModel,
};

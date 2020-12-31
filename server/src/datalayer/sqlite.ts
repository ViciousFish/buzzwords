import { Sequelize } from "sequelize";

import { Game } from "../types";

export default class SQLite {
  sequelize;
  constructor() {
    this.sequelize = new Sequelize("sqlite::memory:");
  }

  getGamesByUserId(id: string): Game[] {
    throw new Error("Not implemented");
  }
  getGameById(id: string): Game | null {
    throw new Error("Not implemented");
  }
  createGame(userId: string): Game {
    throw new Error("Not implemented");
  }
  joinGame(userId: string, gameId: string): boolean {
    throw new Error("Not implemented");
  }
  makeGameMove(userId: string, gameId: string, move: string): void {
    throw new Error("Not implemented");
  }
}

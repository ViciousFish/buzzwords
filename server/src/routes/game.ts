import * as R from "ramda";
import express, { Router } from "express";
import { Server } from "socket.io";

import { getBotMove } from "buzzwords-shared/bot";
import { HexCoord } from "buzzwords-shared/types";
import Game from "buzzwords-shared/Game";

import dl from "../datalayer";
import getConfig from "../config";
import GameManager from "../GameManager";
import { WordsObject, BannedWordsObject } from "../words";
import { removeMongoId } from "../util";
import { ensureNickname } from "./user";

export default (io: Server): Router => {
  const router = express.Router();
  router.get("/", async (req, res) => {
    const user = res.locals.userId as string;
    const games = await dl.getGamesByUserId(user);
    const userIds: string[] = R.pipe(
      R.map(R.prop("users")),
      R.flatten,
      R.uniq
    )(games);

    const nicknames = await dl.getNickNames(userIds);

    const users: {
      [key: string]: {
        id: string;
        nickname: string | null;
      };
    } = {};

    for (const [id, nickname] of Object.entries(nicknames)) {
      users[id] = {
        id,
        nickname,
      };
    }

    res.send({
      games,
      users,
    });
  });

  router.get("/:id", async (req, res) => {
    const gameId = req.params.id;
    const game = await dl.getGameById(gameId);
    if (game) {
      res.send(game);
    } else {
      res.sendStatus(404);
    }
  });

  router.post("/", async (req, res) => {
    const userId = res.locals.userId as string;
    const session = await dl.createContext();
    const games = await dl.getGamesByUserId(userId, {
      session,
    });

    const activeGames = games.filter(
      (game) => !game.deleted && !game.gameOver
    ).length;

    const maxGames = getConfig().maxActiveGames;
    if (activeGames >= maxGames) {
      res.status(400).json({
        message: `Max ${maxGames} games supported.`,
      });
      return;
    }

    const options = req.body;
    const gm = new GameManager(null);
    const game = gm.createGame(userId);
    if (options.vsAI) {
      game.vsAI = true;
      game.users.push("AI");
      let difficulty = 1;
      if (options.difficulty) {
        difficulty =
          typeof options.difficulty == "number"
            ? options.difficulty
            : parseInt(options.difficulty);
        if (
          typeof difficulty != "number" ||
          isNaN(difficulty) ||
          difficulty < 1 ||
          difficulty > 10
        ) {
          res.status(400).json({
            message: "Difficulty must be a number 1-10",
          });
          return;
        }
      }
      game.difficulty = difficulty;
    }
    try {
      let success = await dl.saveGame(game.id, game, { session });
      if (!success) {
        res.sendStatus(500);
        return;
      }
      success = await dl.commitContext(session);
      if (!success) {
        res.sendStatus(500);
        return;
      }
      res.send(game.id);
      ensureNickname(userId, io);
      return;
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  });

  router.post("/:id/delete", async (req, res) => {
    const user = res.locals.userId as string;
    const gameId = req.params.id;
    const session = await dl.createContext();
    const game = await dl.getGameById(gameId, {
      session,
    });
    if (!game || !game.users.includes(user)) {
      res.sendStatus(404);
      return;
    }
    if (game.users.length > 1) {
      res.sendStatus(400);
      return;
    }

    if (game.deleted) {
      res.sendStatus(201);
      return;
    }

    game.deleted = true;

    let success = await dl.saveGame(gameId, game, { session });

    if (!success) {
      res.sendStatus(500);
      return;
    }

    success = await dl.commitContext(session);
    res.sendStatus(success ? 201 : 500);
    return;
  });

  router.post("/:id/join", async (req, res) => {
    const user = res.locals.userId as string;
    const gameId = req.params.id;
    const success = await dl.joinGame(user, gameId);
    const game = await dl.getGameById(gameId);
    if (game && success) {
      game.users.forEach((user) => {
        io.to(user).emit("game updated", game);
      });
      console.log("join user", user);
      ensureNickname(user, io);
      res.sendStatus(201);
    } else {
      res.sendStatus(404);
    }
  });

  router.post("/join", async (req, res) => {
    const user = res.locals.userId as string;
    const success = await dl.joinRandomGame(user);
    res.sendStatus(success ? 201 : 404);
  });

  const pass = async (gameId: string, userId: string) => {
    const session = await dl.createContext();

    const game = await dl.getGameById(gameId, {
      session,
    });

    if (!game) {
      return;
    }

    const gm = new GameManager(game);

    const newGame = gm.pass(userId);

    await dl.saveGame(gameId, newGame, {
      session,
    });
    await dl.commitContext(session);
    newGame.users.forEach((user) => {
      io.to(user).emit("game updated", game);
    });
  };

  router.post("/:id/pass", async (req, res) => {
    const user = res.locals.userId as string;
    const gameId = req.params.id;

    const game = await dl.getGameById(gameId);
    if (game == null || game == undefined || !game.users.includes(user)) {
      res.sendStatus(404);
      return;
    }

    if (game.users[game.turn] != user) {
      res.status(400).json({
        message: "It is not your turn",
      });
    }

    try {
      pass(game.id, user);
    } catch (e) {
      res.status(500);
      if (e instanceof Error) {
        res.send(e.message);
      } else {
        res.send();
      }
      return;
    }

    res.sendStatus(201);
  });

  const doBotMoves = async (gameId: string): Promise<void> => {
    const session = await dl.createContext();

    let game = await dl.getGameById(gameId, {
      session,
    });

    if (!game) {
      return;
    }

    const gm = new GameManager(game);
    let lastMessage = Date.now();

    while (!game.gameOver && game.vsAI && game.turn) {
      let botMove: HexCoord[];
      try {
        botMove = getBotMove(game.grid, {
          words: WordsObject,
          difficulty: game.difficulty,
          bannedWords: BannedWordsObject,
        });
      } catch (e) {
        console.log("BOT FAILED TO FIND MOVE. PASSING");
        await dl.commitContext(session);
        pass(game.id, "AI");
        return;
      }
      console.log("Bot move", botMove);
      const response = gm.makeMove("AI", botMove);
      const valid = Boolean(response.game);
      await dl.saveMove(response.word, valid, { session });
      if (!response.game) {
        return;
      }
      game = response.game;
      await dl.saveGame(gameId, game, {
        session,
      });
      const delay = 2000 - (Date.now() - lastMessage);
      game.users.forEach((user) => {
        const copy = R.clone(removeMongoId(game));
        setTimeout(() => {
          io.to(user).emit("game updated", copy);
        }, delay);
      });
      lastMessage = Date.now() + delay;
    }
    await dl.commitContext(session);
  };

  router.post("/:id/nudge", async (req, res) => {
    const user = res.locals.userId as string;
    const gameId = req.params.id;

    const game = await dl.getGameById(gameId);
    if (game == null || game == undefined || !game.users.includes(user)) {
      res.sendStatus(404);
      return;
    }

    if (game.users[game.turn] == user) {
      res.status(400).json({
        message: "It is your turn",
      });
      return;
    }

    try {
      if (game.users[game.turn] == "AI") {
        doBotMoves(gameId);
      }
    } catch (e) {
      res.status(500);
      if (e instanceof Error) {
        res.send(e.message);
      } else {
        res.send();
      }
      return;
    }

    res.sendStatus(201);
  });

  router.post("/:id/move", async (req, res) => {
    const user = res.locals.userId as string;
    const gameId = req.params.id;
    const parsedMove: HexCoord[] = [];
    const move = req.body.move || [];
    for (const m of move) {
      if (typeof m == "object") {
        if (typeof m.q == "number" && typeof m.r == "number") {
          parsedMove.push({
            q: m.q,
            r: m.r,
          });
        }
      }
    }
    const session = await dl.createContext();

    const game = await dl.getGameById(gameId, {
      session,
    });
    if (game == null || game == undefined) {
      res.sendStatus(404);
      return;
    }
    const gm = new GameManager(game);

    let newGame: Game;
    try {
      const { game, word } = gm.makeMove(user, parsedMove);
      const valid = Boolean(game);
      await dl.saveMove(word, valid, { session });
      if (!valid) {
        res.status(400);
        res.send("Invalid word");
        return;
      }
      if (!game) {
        res.sendStatus(500);
        return;
      }
      newGame = game;
    } catch (e: unknown) {
      res.status(400);
      if (e instanceof Error) {
        res.send(e.message);
      } else {
        res.send();
      }
      return;
    }
    try {
      await dl.saveGame(gameId, newGame, {
        session,
      });
      await dl.commitContext(session);
    } catch (e) {
      res.sendStatus(500);
      return;
    }

    res.status(201);
    res.send(newGame);
    newGame.users.forEach((user) => {
      io.to(user).emit("game updated", newGame);
    });

    doBotMoves(gameId);
  });

  router.post("/:id/forfeit", async (req, res) => {
    const user = res.locals.userId as string;
    const gameId = req.params.id;

    const session = await dl.createContext();

    const game = await dl.getGameById(gameId, {
      session,
    });
    if (game == null || game == undefined || !game.users.includes(user)) {
      res.sendStatus(404);
      return;
    }
    const gm = new GameManager(game);

    let newGame: Game;
    try {
      newGame = gm.forfeit(user);
    } catch (e: unknown) {
      res.status(400);
      if (e instanceof Error) {
        res.send(e.message);
      } else {
        res.send();
      }
      return;
    }
    try {
      await dl.saveGame(gameId, newGame, {
        session,
      });
      await dl.commitContext(session);
    } catch (e) {
      res.sendStatus(500);
      return;
    }

    res.status(201);
    res.send(newGame);
    newGame.users.forEach((user) => {
      io.to(user).emit("game updated", newGame);
    });
  });

  return router;
};

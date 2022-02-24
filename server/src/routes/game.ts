import * as R from "ramda";
import express from "express";
import { Server } from "socket.io";

import { getBotMove } from "buzzwords-shared/bot";
import { HexCoord } from "buzzwords-shared/types";
import Game from "buzzwords-shared/Game";

import dl from "../datalayer";
import getConfig from "../config";
import GameManager from "../GameManager";
import { WordsObject } from "../words";
import { removeMongoId } from "../util";

export default (io: Server) => {
  const router = express.Router();
  router.get("/", async (req, res) => {
    const user = res.locals.userId as string;
    const games = await dl.getGamesByUserId(user);
    const userIds: string[] = R.pipe(
      R.map(R.prop("users")),
      R.flatten,
      R.uniq
    )(games);
    const nicknames = await Promise.all(
      R.map((id) => dl.getNickName(id), userIds)
    );

    const users: {
      [key: string]: {
        id: string;
        nickname: string | null;
      };
    } = {};

    for (let i = 0; i < nicknames.length; i++) {
      users[userIds[i]] = {
        id: userIds[i],
        nickname: nicknames[i],
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
    const user = res.locals.userId as string;
    const session = await dl.createContext();
    const games = await dl.getGamesByUserId(user, {
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
    const game = gm.createGame(user);
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
        });
      } catch (e) {
        console.log("BOT FAILED TO FIND MOVE. PASSING");
        pass(game.id, "AI");
        return;
      }
      console.log("Bot move", botMove);
      game = gm.makeMove("AI", botMove);
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
        if (m.q && typeof m.q == "number" && m.r && typeof m.r == "number") {
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
      newGame = gm.makeMove(user, move);
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

  return router;
};

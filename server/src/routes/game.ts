import * as R from "ramda";
import express, { Router } from "express";
import { Server } from "socket.io";
import { getMessaging, Notification } from "firebase-admin/messaging";
import urljoin from "url-join";
import bunyan from "bunyan";
import * as opentelemetry from "@opentelemetry/api";

import { getBotMove } from "buzzwords-shared/bot";
import { HexCoord } from "buzzwords-shared/types";
import Game from "buzzwords-shared/Game";

import dl from "../datalayer";
import getConfig from "../config";
import GameManager from "../GameManager";
import { WordsObject, BannedWordsObject } from "../words";
import { removeMongoId } from "../util";
import { ensureNickname } from "./user";

const logger = bunyan.createLogger({
  name: "buzzwords-server",
});

const tracer = opentelemetry.trace.getTracer("buzzwords-game-routes");

async function sendPush(
  notificationRecipient: string,
  notification: Notification,
  gameId: string
) {
  const config = getConfig();
  if (!config.enablePushNotifications) {
    return;
  }
  const pushTokens = await dl.getPushTokensByUserId(notificationRecipient);
  if (!pushTokens.length) {
    return;
  }
  const tokens = pushTokens.map((pt) => pt.token);

  const url = urljoin(config.notificationGameBaseUrl, gameId);

  const res = await getMessaging().sendEachForMulticast({
    notification: {
      imageUrl: "https://buzzwords.gg/apple-touch-icon.png",
      ...notification,
    },
    data: {
      url,
    },
    webpush: {
      fcmOptions: {
        link: url,
      },
    },
    tokens,
  });
  res.responses.forEach((r, i) => {
    if (r.success) {
      return;
    }
    if (r.error?.code === "messaging/registration-token-not-registered") {
      dl.deletePushToken(tokens[i]);
    }
  });
}

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
      logger.error(e);
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
      await ensureNickname(user, io);

      game.users.forEach((user) => {
        io.to(user).emit("game updated", game);
      });

      const title = "Buzzwords: it's your turn";
      const body = `${
        (await dl.getUserById(user))?.nickname
      } accepted your challenge`;
      game.users
        .filter((u) => u !== user && u !== "AI")
        .forEach((u) => sendPush(u, { title, body }, gameId));

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
      logger.error(e);
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
    return tracer.startActiveSpan("doBotMoves", async (span) => {
      try {
        span.setAttributes({
          "game.id": gameId,
          "bot.player": "AI"
        });

        const session = await dl.createContext();

        let game = await dl.getGameById(gameId, {
          session,
        });

        if (!game) {
          span.setStatus({ 
            code: opentelemetry.SpanStatusCode.ERROR, 
            message: "Game not found" 
          });
          return;
        }

        span.setAttributes({
          "game.difficulty": game.difficulty,
          "game.vsAI": game.vsAI,
          "game.gameOver": game.gameOver,
          "game.turn": game.turn
        });

        const gm = new GameManager(game);
        let lastMessage = Date.now();
        let moveCount = 0;

        while (!game.gameOver && game.vsAI && game.turn) {
          await tracer.startActiveSpan("botMove", async (moveSpan) => {
            try {
              moveCount++;
              moveSpan.setAttributes({
                "bot.moveNumber": moveCount,
                "game.difficulty": game!.difficulty,
                "game.turn": game!.turn
              });

              let botMove: HexCoord[];
              try {
                botMove = await tracer.startActiveSpan("getBotMove", async (getBotSpan) => {
                  try {
                    const move = getBotMove(game!.grid, {
                      words: WordsObject,
                      difficulty: game!.difficulty,
                      bannedWords: BannedWordsObject,
                    });
                    
                    getBotSpan.setAttributes({
                      "bot.moveLength": move.length,
                      "bot.difficulty": game!.difficulty
                    });
                    
                    getBotSpan.setStatus({ code: opentelemetry.SpanStatusCode.OK });
                    return move;
                  } catch (error) {
                    getBotSpan.recordException(error as Error);
                    getBotSpan.setStatus({ 
                      code: opentelemetry.SpanStatusCode.ERROR, 
                      message: (error as Error).message 
                    });
                    throw error;
                  } finally {
                    getBotSpan.end();
                  }
                });
              } catch (e) {
                logger.info("BOT FAILED TO FIND MOVE. PASSING");
                moveSpan.setAttributes({
                  "bot.action": "pass",
                  "bot.reason": "no_valid_move"
                });
                await dl.commitContext(session);
                pass(game!.id, "AI");
                moveSpan.setStatus({ 
                  code: opentelemetry.SpanStatusCode.OK,
                  message: "Bot passed - no valid move found"
                });
                return;
              }
              
              logger.info({botMove}, "Bot move");
              moveSpan.setAttributes({
                "bot.action": "move",
                "bot.word": botMove.map(coord => {
                  const cell = game!.grid[`${coord.q},${coord.r}`];
                  return cell?.value || '';
                }).join(''),
                "bot.moveCoords": JSON.stringify(botMove)
              });

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

              moveSpan.setAttributes({
                "game.gameOver": game.gameOver,
                "game.winner": game.winner || -1,
                "bot.delay": delay
              });

              moveSpan.setStatus({ code: opentelemetry.SpanStatusCode.OK });
            } catch (error) {
              moveSpan.recordException(error as Error);
              moveSpan.setStatus({ 
                code: opentelemetry.SpanStatusCode.ERROR, 
                message: (error as Error).message 
              });
              throw error;
            } finally {
              moveSpan.end();
            }
          });
        }
        
        await dl.commitContext(session);
        
        span.setAttributes({
          "bot.totalMoves": moveCount,
          "game.finalGameOver": game.gameOver,
          "game.finalWinner": game.winner || -1
        });
        
        span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ 
          code: opentelemetry.SpanStatusCode.ERROR, 
          message: (error as Error).message 
        });
        throw error;
      } finally {
        span.end();
      }
    });
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
      logger.error(e);
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
      newGame = gm.makeMove(user, parsedMove);
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
      logger.error(e);
      res.sendStatus(500);
      return;
    }

    res.status(201);
    res.send(newGame);

    newGame.users.forEach(async (user) => {
      io.to(user).emit("game updated", newGame);
    });

    const opponent =
      user === "AI" ? "Computer" : (await dl.getUserById(user))?.nickname;
    const word =
      newGame.moves[newGame.moves.length - 1]?.letters.join("").toUpperCase() ??
      "";

    const title = "Buzzwords: it's your turn";
    const body = `${opponent} played ${word}`;

    newGame.users
      .filter((u) => u !== user && u !== "AI")
      .forEach((u) => sendPush(u, { title, body }, newGame.id));

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

import * as R from "ramda";
import express from "express";
import { Server } from "socket.io";

import { getBotMove } from "buzzwords-shared/bot";
import { HexCoord } from "buzzwords-shared/types";
import Game, { Move } from "buzzwords-shared/Game";

import dl from "../datalayer";
import getConfig from "../config";
import GameManager from "../GameManager";
import { WordsObject, BannedWordsObject } from "../words";
import { prismaGameToAPIGame, removeMongoId } from "../util";

import { PrismaClient, Prisma } from "@prisma/client";
import isURL from "validator/lib/isURL";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

export default (io: Server) => {
  const router = express.Router();
  router.get("/", async (req, res) => {
    const userId = res.locals.userId as string;
    const gameUsers = await prisma.gameUser.findMany({
      where: {
        user_id: userId,
        game: {
          deleted: false,
        },
      },
      include: {
        game: {
          include: {
            cells: {
              where: {
                move_id: null,
              },
            },
            users: {
              include: {
                user: true,
              },
            },
            moves: {
              include: {
                cells: true,
                coords: true,
              },
            },
          },
        },
      },
    });

    const users: {
      [key: string]: {
        id: string;
        nickname: string | null;
      };
    } = {};
    const games: Game[] = [];
    for (const gameUser of gameUsers) {
      for (const user of gameUser.game.users) {
        users[user.user_id] = {
          id: user.user_id,
          nickname: user.user.nickname,
        };
      }
      const g = gameUser.game;

      games.push(prismaGameToAPIGame(g));
    }

    res.send({
      games,
      users,
    });
  });

  router.get("/:id", async (req, res) => {
    const game = await prisma.game.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        cells: {
          where: {
            move_id: null,
          },
        },
        users: {
          include: {
            user: true,
          },
        },
        moves: {
          include: {
            cells: true,
            coords: true,
          },
        },
      },
    });

    if (game) {
      res.send(prismaGameToAPIGame(game));
    } else {
      res.sendStatus(404);
    }
  });

  router.post("/", async (req, res) => {
    const userId = res.locals.userId as string;
    await prisma
      .$transaction(async (tx) => {
        const activeGames = await tx.gameUser.count({
          where: {
            user_id: userId,
            game: {
              deleted: false,
              game_over: false,
            },
          },
        });

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

        await tx.game.create({
          data: {
            id: game.id,
            turn: game.turn,
            game_over: game.gameOver,
            deleted: game.deleted,
            winner: game.winner,
            vs_ai: game.vsAI,
            difficulty: game.difficulty,
            users: {
              create: game.users.map((u, idx) => ({
                user_id: u,
                player_number: idx,
              })),
            },
            cells: {
              create: Object.values(game.grid).map((cell) => ({
                q: cell.q,
                r: cell.r,
                value: cell.value,
                capital: cell.capital,
                owner: cell.owner,
                move_id: null,
              })),
            },
            createdDate: new Date(),
          },
        });
        res.send(game.id);
        return;
      })
      .catch((e) => {
        res.sendStatus(500);
      });
  });

  router.post("/:id/delete", async (req, res) => {
    const userId = res.locals.userId as string;
    const gameId = req.params.id;

    await prisma
      .$transaction(async (tx) => {
        const game = await tx.game.findUnique({
          where: {
            id: gameId,
          },
          include: {
            users: true,
          },
        });

        if (!game || !game.users.find((u) => u.user_id === userId)) {
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

        await tx.game.update({
          where: {
            id: gameId,
          },
          data: {
            deleted: true,
          },
        });

        res.sendStatus(201);
      })
      .catch((e) => res.sendStatus(500));
  });

  router.post("/:id/join", async (req, res) => {
    const userId = res.locals.userId as string;
    const gameId = req.params.id;

    await prisma
      .$transaction(async (tx) => {
        const gameUsers = await tx.gameUser.findMany({
          where: {
            game_id: gameId,
          },
        });

        if (gameUsers.length != 1 || gameUsers[0].user_id == userId) {
          res.sendStatus(404);
          return;
        }
        await tx.gameUser.create({
          data: {
            game_id: gameId,
            user_id: userId,
            player_number: 1,
          },
        });

        const prismaGame = await tx.game.findUnique({
          where: {
            id: gameId,
          },
          include: {
            cells: {
              where: {
                move_id: null,
              },
            },
            users: {
              include: {
                user: true,
              },
            },
            moves: {
              include: {
                cells: true,
                coords: true,
              },
            },
          },
        });
        if (prismaGame) {
          const game = prismaGameToAPIGame(prismaGame);
          game.users.forEach((user) => {
            io.to(user).emit("game updated", game);
          });
          res.sendStatus(201);
        } else {
          res.sendStatus(404);
        }
      })
      .catch((e) => res.sendStatus(500));
  });

  router.post("/join", async (req, res) => {
    const userId = res.locals.userId as string;
    await prisma
      .$transaction(async (tx) => {
        const result = await tx.gameUser.groupBy({
          by: ["game_id"],
          where: {
            user_id: {
              not: userId,
            },
          },
          _count: {
            user_id: true,
          },
          orderBy: {
            _count: {
              user_id: "asc",
            },
          },
          take: 1,
        });

        const gameId = result[0]?.game_id;

        if (gameId) {
          await tx.gameUser.create({
            data: {
              game_id: gameId,
              user_id: userId,
              player_number: 1,
            },
          });

          const prismaGame = await tx.game.findUnique({
            where: {
              id: gameId,
            },
            include: {
              cells: {
                where: {
                  move_id: null,
                },
              },
              users: {
                include: {
                  user: true,
                },
              },
              moves: {
                include: {
                  cells: true,
                  coords: true,
                },
              },
            },
          });
          if (prismaGame) {
            const game = prismaGameToAPIGame(prismaGame);
            game.users.forEach((user) => {
              io.to(user).emit("game updated", game);
            });
            res.sendStatus(201);
          } else {
            res.sendStatus(404);
          }
        } else {
          res.sendStatus(404);
        }
      })
      .catch((e) => {
        res.sendStatus(500);
      });
  });

  const pass = async (
    gameId: string,
    userId: string,
    tx: Prisma.TransactionClient
  ) => {
    const prismaGame = await tx.game.findUnique({
      where: {
        id: gameId,
      },
      include: {
        cells: {
          where: {
            move_id: null,
          },
        },
        users: {
          include: {
            user: true,
          },
        },
        moves: {
          include: {
            cells: true,
            coords: true,
          },
        },
      },
    });

    if (!prismaGame) {
      return;
    }
    const game = prismaGameToAPIGame(prismaGame);
    const gm = new GameManager(game);
    const newGame = gm.pass(userId);
    // Opponent capital might have changed
    // If so, update it
    for (const c of Object.values(newGame.grid)) {
      if (c.capital && c.owner == Number(!game.turn)) {
        if (!game.grid[`${c.q},${c.r}`].capital) {
          await tx.cell.updateMany({
            where: {
              q: c.q,
              r: c.r,
            },
            data: {
              capital: true,
            },
          });
        }
        break;
      }
    }
    // Game turn has changed
    await tx.game.update({
      where: {
        id: gameId,
      },
      data: {
        turn: newGame.turn,
      },
    });
    const move = await tx.move.findFirst({
      where: {
        game_id: gameId,
      },
      orderBy: {
        move_number: "desc",
      },
      take: 1,
    });

    const moveNumber = (move?.move_number ?? 0) + 1;

    await tx.move.create({
      data: {
        date: new Date(),
        pass: true, // User passed!
        forfeit: false,
        shuffle: false,
        game_id: gameId,
        user_id: userId,
        move_number: moveNumber,
        word: null,
        cells: {
          create: Object.values(game.grid).map((c) => ({
            game_id: gameId,
            q: c.q,
            r: c.r,
            value: c.value,
            capital: c.capital,
            owner: c.owner,
          })),
        },
      },
    });

    newGame.users.forEach((user) => {
      io.to(user).emit("game updated", newGame);
    });
  };

  router.post("/:id/pass", async (req, res) => {
    const userId = res.locals.userId as string;
    const gameId = req.params.id;

    await prisma
      .$transaction(async (tx) => {
        const game = await tx.game.findUnique({
          where: {
            id: gameId,
          },
          include: {
            users: true,
          },
        });

        if (
          game == null ||
          game == undefined ||
          !game.users.find((u) => u.user_id == userId)
        ) {
          res.sendStatus(404);
          return;
        }

        if (game.users[game.turn].user_id != userId) {
          res.status(400).json({
            message: "It is not your turn",
          });
        }

        try {
          await pass(gameId, userId, tx);
        } catch (e) {
          res.status(500);
          if (e instanceof Error) {
            res.send(e.message);
          } else {
            res.send();
          }
          throw e;
        }
        res.sendStatus(201);
      })
      .catch();
  });

  const doBotMoves = async (gameId: string): Promise<void> => {
    await prisma
      .$transaction(async (tx) => {
        const prismaGame = await tx.game.findUnique({
          where: {
            id: gameId,
          },
          include: {
            cells: {
              where: {
                move_id: null,
              },
            },
            users: {
              include: {
                user: true,
              },
            },
            moves: {
              include: {
                cells: true,
                coords: true,
              },
            },
          },
        });

        if (!prismaGame) {
          return;
        }
        let game = prismaGameToAPIGame(prismaGame);
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
            pass(game.id, "AI", tx);
            return;
          }
          console.log("Bot move", botMove);
          const word = botMove
            .map((c) => game.grid[`${c.q},${c.r}`].value)
            .join("");
          game = gm.makeMove("AI", botMove);

          await tx.game.update({
            where: {
              id: gameId,
            },
            data: {
              turn: game.turn,
              game_over: game.gameOver,
              deleted: game.deleted,
              winner: game.winner,
              vs_ai: game.vsAI,
              difficulty: game.difficulty,
            },
          });
          for (const cell of Object.values(game.grid)) {
            await tx.cell.updateMany({
              where: {
                game_id: game.id,
                q: cell.q,
                r: cell.r,
              },
              data: {
                capital: cell.capital,
                owner: cell.owner,
                value: cell.value,
              },
            });
          }
          const move = await tx.move.findFirst({
            where: {
              game_id: gameId,
            },
            orderBy: {
              move_number: "desc",
            },
            take: 1,
          });

          const moveNumber = (move?.move_number ?? 0) + 1;
          await tx.move.create({
            data: {
              date: new Date(),
              pass: false,
              forfeit: false,
              shuffle: false,
              game_id: gameId,
              user_id: "AI",
              move_number: moveNumber,
              word,
              cells: {
                create: Object.values(game.grid).map((c) => ({
                  game_id: gameId,
                  q: c.q,
                  r: c.r,
                  value: c.value,
                  capital: c.capital,
                  owner: c.owner,
                })),
              },
              coords: {
                create: botMove.map(({ q, r }, index) => ({
                  index,
                  q,
                  r,
                })),
              },
            },
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
      })
      .catch();
  };

  router.post("/:id/nudge", async (req, res) => {
    const userId = res.locals.userId as string;
    const gameId = req.params.id;

    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
      include: {
        users: true,
      },
    });

    if (
      game == null ||
      game == undefined ||
      !game.users.find((u) => u.user_id == userId)
    ) {
      res.sendStatus(404);
      return;
    }

    if (
      game.users.find((u) => u.player_number == game.turn)?.user_id == userId
    ) {
      res.status(400).json({
        message: "It is your turn",
      });
      return;
    }

    try {
      if (
        game.users.find((u) => u.player_number == game.turn)?.user_id == "AI"
      ) {
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
    const userId = res.locals.userId as string;
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

    await prisma
      .$transaction(async (tx) => {
        const prismaGame = await tx.game.findUnique({
          where: {
            id: gameId,
          },
          include: {
            cells: {
              where: {
                move_id: null,
              },
            },
            users: {
              include: {
                user: true,
              },
            },
            moves: {
              include: {
                cells: true,
                coords: true,
              },
            },
          },
        });

        if (prismaGame == null || prismaGame == undefined) {
          res.sendStatus(404);
          return;
        }
        const game = prismaGameToAPIGame(prismaGame);
        const gm = new GameManager(game);

        let newGame: Game;
        try {
          newGame = gm.makeMove(userId, parsedMove);
        } catch (e: unknown) {
          res.status(400);
          if (e instanceof Error) {
            res.send(e.message);
          } else {
            res.send();
          }
          return;
        }
        await tx.game.update({
          where: {
            id: gameId,
          },
          data: {
            turn: newGame.turn,
            game_over: newGame.gameOver,
            deleted: newGame.deleted,
            winner: newGame.winner,
            vs_ai: newGame.vsAI,
            difficulty: newGame.difficulty,
          },
        });
        for (const cell of Object.values(newGame.grid)) {
          await tx.cell.updateMany({
            where: {
              game_id: newGame.id,
              q: cell.q,
              r: cell.r,
            },
            data: {
              capital: cell.capital,
              owner: cell.owner,
              value: cell.value,
            },
          });
        }
        const move = await tx.move.findFirst({
          where: {
            game_id: gameId,
          },
          orderBy: {
            move_number: "desc",
          },
          take: 1,
        });

        const moveNumber = (move?.move_number ?? 0) + 1;
        await tx.move.create({
          data: {
            date: new Date(),
            pass: false,
            forfeit: false,
            shuffle: false,
            game_id: gameId,
            user_id: userId,
            move_number: moveNumber,
            word: game.moves[game.moves.length - 1].letters.join(""),
            cells: {
              create: Object.values(game.grid).map((c) => ({
                game_id: gameId,
                q: c.q,
                r: c.r,
                value: c.value,
                capital: c.capital,
                owner: c.owner,
              })),
            },
            coords: {
              create: parsedMove.map(({ q, r }, index) => ({
                index,
                q,
                r,
              })),
            },
          },
        });
        res.status(201);
        res.send(newGame);
        newGame.users.forEach((user) => {
          io.to(user).emit("game updated", newGame);
        });

        try {
          doBotMoves(gameId);
        } catch (e) {
          // maybe do something eventually
        }
      })
      .catch((e) => res.sendStatus(500));
  });

  router.post("/:id/forfeit", async (req, res) => {
    const userId = res.locals.userId as string;
    const gameId = req.params.id;

    await prisma
      .$transaction(async (tx) => {
        const game = await tx.game.findUnique({
          where: {
            id: gameId,
          },
          include: {
            cells: {
              where: {
                move_id: null,
              },
            },
            users: {
              include: {
                user: true,
              },
            },
            moves: {
              include: {
                cells: true,
                coords: true,
              },
            },
          },
        });

        if (
          game == null ||
          game == undefined ||
          !game.users.find((u) => u.user_id == userId)
        ) {
          res.sendStatus(404);
          return;
        }

        if (game.game_over) {
          throw new Error("Game is over");
        }
        if (game.users.length != 2) {
          throw new Error("Need another player");
        }
        const idx = game.users.findIndex((u) => u.user_id == userId) as 0 | 1;
        await tx.game.update({
          where: {
            id: gameId,
          },
          data: {
            winner: Number(!idx),
            game_over: true,
          },
        });
        game.winner = Number(!idx);
        game.game_over = true;

        const move = await tx.move.findFirst({
          where: {
            game_id: gameId,
          },
          orderBy: {
            move_number: "desc",
          },
          take: 1,
        });

        const moveNumber = (move?.move_number ?? 0) + 1;

        await tx.move.create({
          data: {
            date: new Date(),
            pass: false,
            forfeit: true, // User forfeited
            shuffle: false,
            game_id: gameId,
            user_id: userId,
            move_number: moveNumber,
            word: null,
            cells: {
              create: game.cells.map((c) => ({
                game_id: gameId,
                q: c.q,
                r: c.r,
                value: c.value,
                capital: c.capital,
                owner: c.owner,
              })),
            },
          },
        });
        const moveId = nanoid();
        game.moves.push({
          id: moveId,
          coords: [],
          date: new Date(),
          pass: false,
          forfeit: true, // User forfeited
          shuffle: false,
          game_id: gameId,
          user_id: userId,
          move_number: moveNumber,
          word: null,
          cells: game.cells.map((c) => ({
            move_id: moveId,
            id: 1,
            game_id: gameId,
            q: c.q,
            r: c.r,
            value: c.value,
            capital: c.capital,
            owner: c.owner,
          })),
        });

        return game;
      })
      .then((prismaGame) => {
        if (prismaGame) {
          const game = prismaGameToAPIGame(prismaGame);
          res.status(201);
          res.send(game);
          game.users.forEach((user) => {
            io.to(user).emit("game updated", game);
          });
        } else {
          throw Error();
        }
      })
      .catch((e) => {
        res.status(400);
        if (e instanceof Error) {
          res.send(e.message);
        } else {
          res.send();
        }
        return;
      });
  });

  return router;
};

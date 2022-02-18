import * as R from "ramda";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { nanoid } from "nanoid";
import morgan from "morgan";
import cookie from "cookie";
import { createAdapter } from "@socket.io/mongo-adapter";
import { Db, MongoClient } from "mongodb";
import cors from "cors";
import passport from "passport";
import { OAuth2Strategy } from "passport-google-oauth";

import getConfig from "./config";
import DL from "./datalayer";
import Game from "buzzwords-shared/Game";
import { getBotMove } from "buzzwords-shared/bot";
import { DataLayer, User } from "./types";
import { HexCoord } from "buzzwords-shared/types";
import GameManager from "./GameManager";
import BannedWords from "./banned_words.json";
import { WordsObject } from "./words";
import { isAnonymousUser } from "./util";

const COLLECTION = "socket.io-adapter-events";

const config = getConfig();

let dl: DataLayer;
switch (config.dbType) {
  case "memory":
    dl = new DL.Memory();
    break;

  case "mongo":
    dl = new DL.Mongo();
    break;

  default:
    console.error("Invalid dbType", config.dbType);
    process.exit(1);
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  // transports: ["websocket"],
  cors: {
    origin: true,
    credentials: true,
  },
});
const mongoClient = new MongoClient(config.mongoUrl, {});

app.use(morgan("dev"));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser(config.cookieSecret));

app.use(async (req, res, next) => {
  const cookies = req.signedCookies || {};
  const bearerToken = req.headers.authorization?.split(" ")[1] ?? null;
  const authToken: string | null = bearerToken || cookies.authToken || null;
  const userId = authToken ? await dl.getUserIdByAuthToken(authToken) : null;

  res.locals.userId = userId;
  res.locals.authToken = authToken;
  next();
});

app.get(config.apiPrefix + "/healthz", (req, res) => {
  res.sendStatus(200);
});

app.get(config.apiPrefix + "/", (req, res) => {
  res.sendStatus(200);
});

app.get(config.apiPrefix + "/user", async (req, res) => {
  let userId = res.locals.userId as string;
  let authToken = null;
  if (!userId) {
    userId = nanoid();
    authToken = nanoid(40);
    await dl.createAuthToken(authToken, userId);
    await dl.setNickName(userId, "");
    res.locals.userId = userId;
  }
  // migrate cookie users to local by echoing back their authToken
  if (!req.headers.authorization && req.signedCookies.authToken) {
    authToken = req.signedCookies.authToken;
  }
  res.cookie("authToken", authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365 * 15, // 15 years
    signed: true,
  });
  const user = await dl.getUserById(userId);
  res.send({
    ...user,
    authToken,
  });
});

app.post(config.apiPrefix + "/user/nickname", async (req, res) => {
  const user = res.locals.userId as string;
  const nickname = (req.body || {})?.nickname as string | null;
  if (!nickname) {
    res.status(400).json({
      message: "Missing nickname in request body",
    });
    return;
  }
  if (R.any((word) => nickname.toLowerCase().trim() === word, BannedWords)) {
    res.status(400).json({
      message: "Nickname contains banned text",
    });
    return;
  }
  const success = await dl.setNickName(user, nickname);
  io.emit("nickname updated", {
    id: user,
    nickname,
  });
  if (success) {
    res.sendStatus(201);
  } else {
    res.sendStatus(500);
  }
});

app.get(config.apiPrefix + "/user/:id", async (req, res) => {
  const nickname = await dl.getNickName(req.params.id);
  res.send({
    id: req.params.id,
    nickname,
  });
});

app.get(config.apiPrefix + "/games", async (req, res) => {
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

app.get(config.apiPrefix + "/game/:id", async (req, res) => {
  const gameId = req.params.id;
  const game = await dl.getGameById(gameId);
  if (game) {
    res.send(game);
  } else {
    res.sendStatus(404);
  }
});

app.post(config.apiPrefix + "/game", async (req, res) => {
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

app.post(config.apiPrefix + "/game/:id/delete", async (req, res) => {
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

app.post(config.apiPrefix + "/game/:id/join", async (req, res) => {
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

app.post(config.apiPrefix + "/game/join", async (req, res) => {
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

app.post(config.apiPrefix + "/game/:id/pass", async (req, res) => {
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

const removeMongoId = <T>(thing: any): T => {
  // eslint-disable-line
  if (!R.is(Object, thing)) {
    return thing;
  } else if (R.is(Date, thing)) {
    // @ts-expect-error no clue lol
    return thing;
  } else if (Array.isArray(thing)) {
    return R.map(removeMongoId, thing) as unknown as T;
  } else {
    thing = R.dissoc("_id", thing);
    return R.map(removeMongoId, thing) as unknown as T;
  }
};

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

app.post(config.apiPrefix + "/game/:id/nudge", async (req, res) => {
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

app.post(config.apiPrefix + "/game/:id/move", async (req, res) => {
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

app.get(config.apiPrefix + "/logout", async (req, res) => {
  res.clearCookie("authToken");
  const authToken = res.locals.authToken;
  const success = await dl.deleteAuthToken(authToken);
  res.sendStatus(success ? 200 : 500);
  return;
});

app.get(
  config.apiPrefix + "/login/google",
  passport.authenticate("google", { scope: ["profile"], state: "FOOBAR" })
);

app.post(config.apiPrefix + "/login/google", async (req, res) => {
  const authToken = res.locals.authToken;

  if (!authToken) {
    // You have to call the /user endpoint first to get an anonymous authToken
    res.sendStatus(400);
    return;
  }

  const state = nanoid(40);

  const success = await dl.setAuthTokenState(authToken, state);
  if (!success) {
    res.sendStatus(500);
    return;
  }

  res.json({
    url:
      "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=profile&flowName=GeneralOAuthFlow&client_id=" +
      config.googleClientId +
      "&redirect_uri=" +
      config.googleCallbackUrl +
      "&state=" +
      state,
  });
  return;
});

app.get(
  config.apiPrefix + "/login/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/",
    failureMessage: true,
  }),
  function (req, res) {
    res.redirect("/");
  }
);

passport.serializeUser((user, done) => {
  console.log("SERIALIZE", user);
  const u = user as User;
  done(null, u.id);
});

passport.deserializeUser((id: string, done) => {
  console.log("DESERIALIZE", id);
  dl.getUserById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});

if (config.googleClientId && config.googleClientSecret) {
  passport.use(
    new OAuth2Strategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: config.googleCallbackUrl,
        passReqToCallback: true,
      },
      async (req, _, __, profile, done) => {
        const state = req.query.state;
        if (!state || Array.isArray(state)) {
          done("Invalid state param");
          return;
        }

        const session = await dl.createContext();
        const authToken = await dl.getAuthTokenByState(state as string, {
          session,
        });
        if (!authToken) {
          dl.commitContext(session).finally(() => {
            done("Invalid state param");
          });
          return;
        }
        const userId = authToken.userId;
        if (!userId) {
          dl.commitContext(session).finally(() => {
            done("Invalid state param");
          });
          return;
        }
        const u = await dl.getUserById(userId, { session });
        const isAnon = u ? isAnonymousUser(u) : true;
        if (!isAnon) {
          // You're already logged in. Can't log in twice!
          dl.commitContext(session).finally(() => {
            done(null, u);
          });
          return;
        }
        dl.getUserByGoogleId(profile.id)
          .then(async (user) => {
            if (!user) {
              let success = await dl.setUserGoogleId(userId, profile.id, {
                session,
              });

              if (!success) {
                done({ message: "error setting google id on user" });
              }
              const result = await dl.getUserById(userId, {
                session,
              });
              user = result;
              await dl.assumeUser(userId, (user as unknown as User).id, {
                session,
              });
              success = await dl.commitContext(session);
              if (!success) {
                done({
                  message: "error committing transaction for google login",
                });
              }
              done(null, user);
            } else {
              await dl.assumeUser(userId, user.id, { session });
              const success = await dl.commitContext(session);
              if (!success) {
                done({
                  message: "error committing transaction for google login",
                });
              }
              done(null, user);
            }
          })
          .catch((err) => done(err));
      }
    )
  );
}

interface SelectionEventProps {
  gameId: string;
  selection: { [position: string]: number };
}

io.on("connection", async (socket) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  const authToken: string | undefined =
    socket.handshake.headers.authorization?.split(" ")[1] ?? cookies?.authToken;

  if (!authToken) {
    console.log("socket missing authorization header");
    socket.emit("error", "rejected socket connection: no authToken provided");
    return;
  }

  const userId = await dl.getUserIdByAuthToken(authToken);

  if (!userId) {
    console.log("rejected socket connection: couldn't find userId from token");
    socket.emit("error", "rejected socket connection: couldn't find userId");
    return;
  }
  socket.join(userId);
  console.log("a user connected", userId);
  socket.on("selection", async ({ selection, gameId }: SelectionEventProps) => {
    const game = await dl.getGameById(gameId);
    if (!game) {
      console.log("no game", gameId);
      return;
    }
    game.users.forEach((user) => {
      io.to(user).emit("selection", { selection, gameId });
    });
  });
  socket.on("disconnect", (reason) => {
    console.log(`user ${userId} disconnected: ${reason}`);
  });
});

const main = async () => {
  if (config.dbType === "mongo") {
    await mongoClient.connect();
    try {
      await mongoClient.db(config.mongoDbName).createCollection(COLLECTION, {
        capped: true,
        size: 1e6,
      });
    } catch (e) {
      // Collection already exists. Do nothing
    }
    const mongoCollection = mongoClient
      .db(config.mongoDbName)
      .collection(COLLECTION);
    io.adapter(createAdapter(mongoCollection));
  }
  server.listen(config.port, () => {
    console.log("Server listening on port", config.port);
  });
};

export default main;

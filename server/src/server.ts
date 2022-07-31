import * as R from "ramda";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { nanoid } from "nanoid";
import morgan from "morgan";
import cookie from "cookie";
import { createAdapter } from "@socket.io/mongo-adapter";
import { MongoClient } from "mongodb";
import cors from "cors";
import passport from "passport";
import { OAuth2Strategy } from "passport-google-oauth";

import getConfig from "./config";
import dl from "./datalayer";
import { DataLayer, User } from "./types";
import GameManager from "./GameManager";
import BannedWords from "./banned_words.json";
import { isAnonymousUser, removeMongoId } from "./util";

import makeUserRouter from "./routes/user";
import makeGameRouter from "./routes/game";

import runMigrations from "./migrations";

const COLLECTION = "socket.io-adapter-events";

const config = getConfig();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});
const mongoClient = new MongoClient(config.mongoUrl, {});

app.use(
  morgan("dev", {
    skip: (_, res) => {
      return res.statusCode < 400;
    },
  })
);
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

app.use(config.apiPrefix + "/user", makeUserRouter(io));
app.use(config.apiPrefix + "/game", makeGameRouter(io));

app.post(config.apiPrefix + "/logout", async (req, res) => {
  res.clearCookie("authToken");
  const authToken = res.locals.authToken;
  const success = await dl.deleteAuthToken(authToken);
  res.sendStatus(success ? 200 : 500);
  return;
});

app.get(
  config.apiPrefix + "/login/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.post(config.apiPrefix + "/login/google", async (req, res) => {
  const authToken = res.locals.authToken;

  if (!authToken) {
    // You have to call the /user endpoint first to get an anonymous authToken
    res.sendStatus(400);
    return;
  }

  const stateId = nanoid(40);

  const success = await dl.setAuthTokenState(authToken, stateId);
  if (!success) {
    res.sendStatus(500);
    return;
  }

  const stateString = JSON.stringify({
    stateId,
    context: req.headers["x-context"] ?? "web",
    redirectUrl: req.headers.referer || "/",
  });
  const state = encodeURIComponent(Buffer.from(stateString).toString("base64"));
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
    let redirectUrl: string;
    let context: string;
    try {
      const res = JSON.parse(
        Buffer.from(
          decodeURIComponent(req.query.state as string),
          "base64"
        ).toString("utf-8")
      );
      redirectUrl = res.redirectUrl;
      context = res.context;
    } catch (e) {
      redirectUrl = "/";
      context = "web";
    }
    if (context === "electron") {
    res.redirect("buzzwords://loginsuccess"); // TODO: do this client side so we can present a pretty "success" message to the user
      return;
    }
    if (typeof redirectUrl === "string") {
      res.redirect(redirectUrl);
    } else {
      res.redirect("/");
    }
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

        let res: any;
        try {
          res = JSON.parse(
            Buffer.from(decodeURIComponent(state as string), "base64").toString(
              "utf-8"
            )
          );
        } catch (e) {
          done("Invalid state param");
          return;
        }
        const { stateId } = res;

        const session = await dl.createContext();
        const authToken = await dl.getAuthTokenByState(stateId as string, {
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
        let u = await dl.getUserById(userId, { session });
        if (!u) {
          // If user doesn't exist, create one!
          u = await dl.createUser(userId, { session });
        }

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
              await dl.deleteUser(userId, { session });
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
    await runMigrations();
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

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
import urljoin from "url-join";
import { PrismaClient } from "@prisma/client";

import getConfig from "./config";
import dl from "./datalayer";
import { User } from "./types";
import { isAnonymousUser } from "./util";

import makeUserRouter from "./routes/user";
import makeGameRouter from "./routes/game";
import makePrismaGameRouter from "./routes/prismaGame";
import makeAdminRouter from "./routes/admin";

import runMigrations from "./migrations";

const prisma = new PrismaClient();

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
  let userId: string | null;
  if (config.dbType === "prisma") {
    userId = authToken
      ? (
          await prisma.authToken.findUnique({
            where: {
              token: authToken,
            },
            include: {
              user: true,
            },
          })
        )?.userId ?? null
      : null;
  } else {
    userId = authToken ? await dl.getUserIdByAuthToken(authToken) : null;
  }

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
app.use(
  config.apiPrefix + "/game",
  config.dbType === "prisma" ? makePrismaGameRouter(io) : makeGameRouter(io)
);
app.use(config.apiPrefix + "/admin", makeAdminRouter());

app.post(config.apiPrefix + "/logout", async (req, res) => {
  res.clearCookie("authToken");
  const authToken = res.locals.authToken;
  console.log("🚀 ~ file: server.ts:107 ~ app.post ~ authToken:", authToken);
  const config = getConfig();
  if (config.dbType === "prisma") {
    try {
      const result = await prisma.authToken.delete({
        where: {
          token: authToken,
        },
      });
      const success = Boolean(result.token.length);
      res.sendStatus(success ? 200 : 500);
      return;
    } catch (e) {
      res.sendStatus(500);
      return;
    }
  } else {
    const success = await dl.deleteAuthToken(authToken);
    res.sendStatus(success ? 200 : 500);
    return;
  }
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

  if (config.dbType === "prisma") {
    try {
      await prisma.authToken.update({
        where: {
          token: authToken,
        },
        data: {
          state: stateId,
        },
      });
    } catch (e) {
      res.sendStatus(500);
      return;
    }
  } else {
    const success = await dl.setAuthTokenState(authToken, stateId);
    if (!success) {
      res.sendStatus(500);
      return;
    }
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
      res.redirect(
        urljoin(
          typeof redirectUrl === "string" ? redirectUrl : "/",
          "/auth/success"
        )
      );
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
  if (config.dbType === "prisma") {
    prisma.user
      .findUnique({
        where: {
          id,
        },
      })
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err);
      });
  } else {
    dl.getUserById(id)
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err);
      });
  }
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

        if (config.dbType === "prisma") {
          prisma.$transaction(async (tx) => {
            const authToken = await tx.authToken.findUnique({
              where: {
                state: stateId,
              },
              include: {
                user: true,
              },
            });
            let u = authToken?.user;
            if (!authToken || !authToken.userId) {
              done("Invalid state param");
              throw new Error("Bad auth token");
            }

            if (!u) {
              u = await tx.user.create({
                data: {
                  id: authToken?.userId,
                },
              });
            }

            const isAnon = u ? isAnonymousUser(u) : true;
            if (!isAnon) {
              done(null, u);
              return;
            }

            let user = await tx.user.findFirst({
              where: {
                googleId: profile.id,
              },
            });
            if (!user) {
              user =
                (await tx.user
                  .update({
                    where: {
                      id: authToken.userId,
                    },
                    data: {
                      googleId: profile.id,
                    },
                  })
                  .catch((err) => {
                    done(err);
                  })) || null;

              if (!user) {
                done("Something went wrong");
                return;
              }
              await tx.gameUser.updateMany({
                where: {
                  user_id: authToken.userId,
                },
                data: {
                  user_id: user.id,
                },
              });

              await tx.authToken.updateMany({
                where: {
                  userId: authToken.userId,
                },
                data: {
                  userId: user.id,
                },
              });
              done(null, user);
            } else {
              await tx.gameUser.updateMany({
                where: {
                  user_id: authToken.userId,
                },
                data: {
                  user_id: user.id,
                },
              });

              await tx.authToken.updateMany({
                where: {
                  userId: authToken.userId,
                },
                data: {
                  userId: user.id,
                },
              });

              await tx.user
                .delete({
                  where: {
                    id: authToken.userId,
                  },
                })
                .catch((err) => {
                  done(err);
                  return;
                });

              done(null, user);
              return;
            }
          });
        } else {
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

  if (config.dbType === "prisma") {
    const userId = (
      await prisma.authToken.findUnique({
        where: {
          token: authToken,
        },
      })
    )?.userId;
    if (!userId) {
      console.log(
        "rejected socket connection: couldn't find userId from token"
      );
      socket.emit("error", "rejected socket connection: couldn't find userId");
      return;
    }
    socket.join(userId);
    console.log("a user connected", userId);
    socket.on(
      "selection",
      async ({ selection, gameId }: SelectionEventProps) => {
        const game = await prisma.game.findUnique({
          where: {
            id: gameId,
          },
          include: {
            users: true,
          },
        });
        if (!game) {
          console.log("no game", gameId);
          return;
        }
        game.users.forEach((user) => {
          io.to(user.user_id).emit("selection", { selection, gameId });
        });
      }
    );
    socket.on("disconnect", (reason) => {
      console.log(`user ${userId} disconnected: ${reason}`);
    });
  } else {
    const userId = await dl.getUserIdByAuthToken(authToken);

    if (!userId) {
      console.log(
        "rejected socket connection: couldn't find userId from token"
      );
      socket.emit("error", "rejected socket connection: couldn't find userId");
      return;
    }
    socket.join(userId);
    console.log("a user connected", userId);
    socket.on(
      "selection",
      async ({ selection, gameId }: SelectionEventProps) => {
        const game = await dl.getGameById(gameId);
        if (!game) {
          console.log("no game", gameId);
          return;
        }
        game.users.forEach((user) => {
          io.to(user).emit("selection", { selection, gameId });
        });
      }
    );
    socket.on("disconnect", (reason) => {
      console.log(`user ${userId} disconnected: ${reason}`);
    });
  }
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
  if (config.dbType === "prisma") {
    await prisma.user.upsert({
      where: {
        id: "AI",
      },
      create: {
        id: "AI",
        nickname: "Computer",
      },
      update: {},
    });
  }
  server.listen(config.port, () => {
    console.log("Server listening on port", config.port);
  });
};

export default main;

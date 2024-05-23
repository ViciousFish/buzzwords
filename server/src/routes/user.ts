import * as R from "ramda";
import { Router } from "express";
import { nanoid } from "nanoid";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

import dl from "../datalayer";
import BannedWords from "../banned_words.json";
import getConfig from "../config";

const prisma = new PrismaClient();

export default (io: Server): Router => {
  const userRouter = Router();

  userRouter.get("/", async (req, res) => {
    let userId = res.locals.userId as string;
    let authToken = null;
    if (!userId) {
      userId = nanoid();
      authToken = nanoid(40);
      if (getConfig().dbType === "prisma") {
        await prisma.authToken.create({
          data: {
            token: authToken,
            user: {
              create: {
                id: userId,
              },
            },
            createdDate: new Date(),
            deleted: false,
          },
        });
      } else {
        await dl.createAuthToken(authToken, userId);
      }
      res.locals.userId = userId;
    }
    // migrate cookie users to local by echoing back their authToken
    if (!req.headers.authorization && req.signedCookies.authToken) {
      authToken = req.signedCookies.authToken;
    }
    const user =
      getConfig().dbType === "prisma"
        ? await prisma.user.findUnique({
            where: {
              id: userId,
            },
          })
        : await dl.getUserById(userId);
    res.send({
      id: userId,
      ...user,
      authToken,
    });
  });

  userRouter.post("/nickname", async (req, res) => {
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
    if (getConfig().dbType === "prisma") {
      await prisma.user
        .update({
          where: {
            id: user,
          },
          data: {
            nickname,
          },
        })
        .then(() => {
          res.sendStatus(201);
        })
        .catch(() => {
          res.sendStatus(500);
        });
    } else {
      const success = await dl.setNickName(user, nickname);
      if (success) {
        res.sendStatus(201);
      } else {
        res.sendStatus(500);
      }
    }
    io.emit("nickname updated", {
      id: user,
      nickname,
    });
  });

  userRouter.get("/:id", async (req, res) => {
    const nickname =
      getConfig().dbType === "prisma"
        ? (await prisma.user.findUnique({ where: { id: req.params.id } }))
            ?.nickname
        : await dl.getNickName(req.params.id);
    res.send({
      id: req.params.id,
      nickname,
    });
  });

  return userRouter;
};

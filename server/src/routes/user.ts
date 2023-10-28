import * as R from "ramda";
import { Router } from "express";
import { nanoid } from "nanoid";
import { Server } from "socket.io";

import dl from "../datalayer";
import BannedWords from "../banned_words.json";

export default (io: Server): Router => {
  const userRouter = Router();

  userRouter.get("/", async (req, res) => {
    let userId = res.locals.userId as string;
    let authToken = null;
    if (!userId) {
      userId = nanoid();
      authToken = nanoid(40);
      await dl.createAuthToken(authToken, userId);
      res.locals.userId = userId;
    }
    // migrate cookie users to local by echoing back their authToken
    if (!req.headers.authorization && req.signedCookies.authToken) {
      authToken = req.signedCookies.authToken;
    }
    const user = await dl.getUserById(userId);
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
    const success = await dl.setNickName(user, nickname);
    if (success) {
      res.sendStatus(201);
    } else {
      res.sendStatus(500);
    }
    io.emit("nickname updated", {
      id: user,
      nickname,
    });
  });

  userRouter.get("/:id", async (req, res) => {
    const nickname = await dl.getNickName(req.params.id);
    res.send({
      id: req.params.id,
      nickname,
    });
  });

  return userRouter;
};

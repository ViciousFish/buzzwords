import { Router } from "express";
// import { MongoServerError } from "mongodb";
import dl from "../datalayer";

export default (): Router => {
  const pushTokenRouter = Router();

  pushTokenRouter.post("/register", async (req, res) => {
    const token = req.body.token as string;
    const userId = res.locals.userId as string;
    if (!token) {
      res.status(400).json({
        message: "Missing token in request body",
      });
      return;
    }
    try {
      const success = await dl.storePushToken(token, userId);
      if (success) {
        res.sendStatus(201);
        return;
      }
    } catch (e) {
      console.error(e);
    }
    res.sendStatus(500);
  });

  // TODO: route to disable notifications for given device (token?)

  return pushTokenRouter;
};

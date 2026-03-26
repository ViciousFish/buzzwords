import { Router } from "express";
import bunyan from "bunyan";
import dl from "../datalayer";

const logger = bunyan.createLogger({
  name: "buzzwords-server",
});

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
      await dl.storePushToken(token, userId);
      res.sendStatus(201);
    } catch (e) {
      logger.error(e, "Failed to register push token");
      res.sendStatus(500);
    }
  });

  pushTokenRouter.post("/unregister", async (req, res) => {
    const token = req.body.token as string;
    if (!token) {
      res.status(400).json({
        message: "Missing token in request body",
      });
      return;
    }
    try {
      await dl.deletePushToken(token);
      res.sendStatus(200);
    } catch (e) {
      logger.error(e, "Failed to unregister push token");
      res.sendStatus(500);
    }
  });

  // TODO: route to disable notifications for given device (token?)

  return pushTokenRouter;
};

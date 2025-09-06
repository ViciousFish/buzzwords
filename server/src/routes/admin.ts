import { Router } from "express";
import { parseDate, today } from "@internationalized/date";
import bunyan from "bunyan";

import dl from "../datalayer";
import getConfig from "../config";

const API_KEY = getConfig().adminApiKey;

const DEFAULT_TZ = "America/New_York";

const logger = bunyan.createLogger({
  name: "buzzwords-server",
});

export default (): Router => {
  const adminRouter = Router();

  adminRouter.use((req, res, next) => {
    if (req.headers.authorization !== `Bearer ${API_KEY}`) {
      logger.info({reqPath: req.path}, "failed request to admin API");
      res.sendStatus(404);
      return;
    }
    next();
  });

  adminRouter.get("/dau/:date?", async (req, res) => {
    const { date: requestDate } = req.params;
    const tz = req.query.timezone as string | undefined;

    try {
      const startCalendarDate = requestDate
        ? parseDate(requestDate)
        : today(tz ?? DEFAULT_TZ);
      const endCalendarDate = startCalendarDate.add({ days: 1 });

      const startDate = startCalendarDate.toDate(tz ?? DEFAULT_TZ);
      const endDate = endCalendarDate.toDate(tz ?? DEFAULT_TZ);

      const daus = await dl.getActiveUsersBetweenDates(startDate, endDate);
      res.json({ daus, startDate, endDate });
    } catch (e) {
      if (
        (e as Error)
          .toString()
          .startsWith("Error: Invalid ISO 8601 date string:")
      ) {
        return res.status(400).send((e as Error).toString());
      }
      return res.status(500).send();
    }
  });

  interface PlayersByDaterangeParams {
    startDate: string;
    endDate: string;
    timezone: string;
  }
  adminRouter.get("/players-by-daterange", async (req, res) => {
    const {
      startDate: _startDate,
      endDate: _endDate,
      timezone,
    } = req.query as unknown as PlayersByDaterangeParams;

    if (!_startDate || !_endDate || !timezone) {
      res.status(400);
      res.send("missing param");
      return;
    }

    try {
      const startCalendarDate = parseDate(_startDate);
      const endCalendarDate = parseDate(_endDate);

      const startDate = startCalendarDate.toDate(timezone);
      const endDate = endCalendarDate.toDate(timezone);

      const players = await dl.getActiveUsersBetweenDates(startDate, endDate);
      res.json({
        players,
        startDate,
        endDate,
      });
    } catch (e) {
      if (
        (e as Error)
          .toString()
          .startsWith("Error: Invalid ISO 8601 date string:")
      ) {
        return res.status(400).send((e as Error).toString());
      }
      return res.status(500).send();
    }
  });

  return adminRouter;
};

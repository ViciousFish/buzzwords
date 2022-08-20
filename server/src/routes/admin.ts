import { Router } from "express";
import { parseDate, today } from "@internationalized/date";

import dl from "../datalayer";
import getConfig from "../config";

const API_KEY = getConfig().adminApiKey;

const DEFAULT_TZ = "America/New_York";

export default (): Router => {
  const adminRouter = Router();

  adminRouter.use((req, res, next) => {
    if (req.headers.authorization !== `Bearer ${API_KEY}`) {
      console.log("failed request to admin API", req.path);
      res.sendStatus(404);
      return;
    }
    next();
  });

  adminRouter.get("/dau/:date?", async (req, res) => {
    const { date: requestDate } = req.params;
    const tz = req.query.timezone as string | undefined;

    const startCalendarDate = requestDate
      ? parseDate(requestDate)
      : today(tz ?? DEFAULT_TZ);
    const endCalendarDate = startCalendarDate.add({ days: 1 });

    const startDate = startCalendarDate.toDate(tz ?? DEFAULT_TZ);
    const endDate = endCalendarDate.toDate(tz ?? DEFAULT_TZ);

    const daus = await dl.getActiveUsersBetweenDates(startDate, endDate);
    res.json({ daus, startDate, endDate });
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
  });

  return adminRouter;
};

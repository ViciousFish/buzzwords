import express from "express";

import getConfig from "./config";

const config = getConfig();

const app = express();

app.get("/healthz", (req, res) => {
  res.sendStatus(200);
});

app.listen(config.port, () => {
  console.log("Server listening on port", config.port);
});

/** Need a web server with the following routes
 * login
 * get games
 * get game
 * create game
 * join game
 * make game move
 *
 * which translates to something like:
 * POST /login
 * GET /games
 * GET /game/<id>
 * POST /game
 * POST /game/<id>/join
 *
 * POST /game/<id>/move
 */

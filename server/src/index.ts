import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { ulid } from "ulid";

import getConfig from "./config";
import DL from "./datalayer";
import Game from "./Game";
import { DataLayer, HexCoord } from "./types";
import GameManager from "./GameManager";

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

app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
  const cookies = req.cookies || {};
  const session = cookies.session || null;
  if (!session) {
    res.cookie("session", ulid());
  }
  next();
});

app.get("/healthz", (req, res) => {
  res.sendStatus(200);
});

app.get("/games", async (req, res) => {
  const user = req.cookies.session;
  const games = await dl.getGamesByUserId(user);
  res.send(games);
});

app.get("/game/:id", async (req, res) => {
  const gameId = req.params.id;
  const game = await dl.getGameById(gameId);
  if (game) {
    res.send(game);
  } else {
    res.sendStatus(404);
  }
});

app.post("/game", async (req, res) => {
  const user = req.cookies.session;
  const gm = new GameManager(null);
  const game = gm.createGame(user);
  try {
    await dl.saveGame(game.id, game);
    res.send(game.id);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/game/:id/join", async (req, res) => {
  const user = req.cookies.session;
  const gameId = req.params.id;
  const success = await dl.joinGame(user, gameId);
  res.sendStatus(success ? 201 : 404);
});

app.post("/game/join", async (req, res) => {
  const user = req.cookies.session;
  const success = await dl.joinRandomGame(user);
  res.sendStatus(success ? 201 : 404);
});

app.post("/game/:id/move", async (req, res) => {
  const user = req.cookies.session;
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
  const game = await dl.getGameById(gameId);
  if (game == null || game == undefined) {
    res.sendStatus(404);
    return;
  }
  const gm = new GameManager(game);

  let newGame;
  try {
    newGame = gm.makeMove(user, move);
  } catch (e) {
    res.status(400);
    res.send(e.message);
    return;
  }
  try {
    await dl.saveGame(gameId, newGame);
  } catch (e) {
    res.sendStatus(500);
    return;
  }

  res.status(201);
  res.send(newGame);
});

app.listen(config.port, () => {
  console.log("Server listening on port", config.port);
});

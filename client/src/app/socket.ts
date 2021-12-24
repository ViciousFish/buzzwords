import { Dispatch } from "@reduxjs/toolkit";
import { io } from "socket.io-client";
import { Game } from "../features/game/game";
import { ApiGame } from "../features/gamelist/gamelistActions";

import { updateGame } from "../features/gamelist/gamelistSlice";
const socket = io();

export const subscribeSocket = (dispatch: Dispatch) => {
  socket.on("game updated", (game: ApiGame) => {
    dispatch(
      updateGame({
        ...game,
        grid: game.grid.cellMap,
      })
    );
  });
};

import { io } from "socket.io-client";

import { receiveSelectionSocket } from "../features/game/gameActions";
import { resetSelection } from "../features/game/gameSlice";
import { ApiGame } from "../features/gamelist/gamelistActions";
import { updateGame } from "../features/gamelist/gamelistSlice";
import { QRCoord } from "../features/hexGrid/hexGrid";
import { AppDispatch } from "./store";
const socket = io();

interface SelectionEventProps {
  gameId: string;
  selection: { [position: QRCoord]: number };
}

export const subscribeSocket = (dispatch: AppDispatch) => {
  socket.on("game updated", (game: ApiGame) => {
    dispatch(
      updateGame({
        ...game,
        grid: game.grid.cellMap,
      })
    );
    dispatch(resetSelection()); // clear selection
  });
  socket.on("selection", ({ gameId, selection }: SelectionEventProps) => {
    console.log("selection", selection);
    dispatch(receiveSelectionSocket(selection, gameId));
  });
};

export const emitSelection = (
  selection: { [position: QRCoord]: number },
  gameId
) => {
  console.log("emitting selection on game", gameId);
  socket.emit("selection", {
    selection,
    gameId,
  });
};

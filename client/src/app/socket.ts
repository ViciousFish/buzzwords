import { io, Socket } from "socket.io-client";

import { receiveSelectionSocket } from "../features/game/gameActions";
import { resetSelection } from "../features/game/gameSlice";
import Game from "buzzwords-shared/Game";
import { updateGame } from "../features/gamelist/gamelistSlice";
import { QRCoord } from "../features/hexGrid/hexGrid";
import { AppDispatch } from "./store";

let socket: Socket | null = null;

interface SelectionEventProps {
  gameId: string;
  selection: { [position: QRCoord]: number };
}

// called by getUser
export const subscribeSocket = (dispatch: AppDispatch) => {
  socket = io();
  socket.on("game updated", (game: Game) => {
    dispatch(
      updateGame({
        ...game,
        grid: game.grid,
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
  if (!socket) {
    console.error('cannot emit: no socket!');
    return;
  }
  console.log("emitting selection on game", gameId);
  socket.emit("selection", {
    selection,
    gameId,
  });
};

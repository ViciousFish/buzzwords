import { io, Socket } from "socket.io-client";

import { receiveSelectionSocket } from "../features/game/gameActions";
import { resetSelection } from "../features/game/gameSlice";
import Game from "buzzwords-shared/Game";
import { QRCoord } from "../features/hexGrid/hexGrid";
import { AppDispatch } from "./store";
import { maybeOpponentNicknameUpdated } from "../features/user/userSlice";
import { receiveGameUpdatedSocket } from "../features/gamelist/gamelistActions";
import { SOCKET_DOMAIN, SOCKET_PATH } from "./apiPrefix";

let socket: Socket | null = null;

interface SelectionEventProps {
  gameId: string;
  selection: { [position: QRCoord]: number };
}

// called by getUser
export const subscribeSocket = (dispatch: AppDispatch) => {
  socket = io(SOCKET_DOMAIN, {
    transports: ["websocket"],
    path: SOCKET_PATH
  });
  socket.on("game updated", (game: Game) => {
    dispatch(receiveGameUpdatedSocket(game));
    dispatch(resetSelection()); // clear selection
  });
  socket.on("selection", ({ gameId, selection }: SelectionEventProps) => {
    console.log("selection", selection);
    dispatch(receiveSelectionSocket(selection, gameId));
  });
  socket.on(
    "nickname updated",
    (data: { id: string; nickname: string }) => {
      dispatch(maybeOpponentNicknameUpdated(data))
    }
  );
};

export const emitSelection = (
  selection: { [position: QRCoord]: number },
  gameId
) => {
  if (!socket) {
    console.error("cannot emit: no socket!");
    return;
  }
  console.log("emitting selection on game", gameId);
  socket.emit("selection", {
    selection,
    gameId,
  });
};

import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";

import { receiveSelectionSocket } from "../features/game/gameActions";
import Game from "buzzwords-shared/Game";
import { QRCoord } from "../features/hexGrid/hexGrid";
import { AppDispatch } from "./store";
import { nicknameUpdated } from "../features/user/userSlice";
import {
  receiveGameUpdatedSocket,
  refreshActiveGames,
} from "../features/gamelist/gamelistActions";
import { SOCKET_DOMAIN, SOCKET_PATH } from "./apiPrefix";
import { setSocketConnected } from "../features/game/gameSlice";
import { retrieveAuthToken } from "../features/user/userActions";

let socket: Socket | null = null;

interface SelectionEventProps {
  gameId: string;
  selection: { [position: QRCoord]: number };
}

// called by getUser
export const subscribeSocket = (dispatch: AppDispatch) => {
  socket = io(SOCKET_DOMAIN, {
    path: SOCKET_PATH,
    extraHeaders: {
      Authorization: `Bearer ${retrieveAuthToken()}`,
    },
  });
  socket.io.on("close", () => {
    dispatch(setSocketConnected(false));
  });

  socket.io.on("open", () => {
    dispatch(setSocketConnected(true));
  });

  socket.io.on("reconnect", () => {
    dispatch(refreshActiveGames());
    dispatch(setSocketConnected(true));
  });

  socket.on("error", (e) => {
    if (typeof e === "string" && e.startsWith("rejected socket connection:")) {
      alert("Sorry, something went wrong on our end. Reloading");
      location.reload();
      return;
    }
    toast("error: " + e, {
      type: "error",
    });
  });
  socket.on("game updated", (game: Game) => {
    dispatch(receiveGameUpdatedSocket(game));
  });
  socket.on("selection", ({ gameId, selection }: SelectionEventProps) => {
    console.log("selection", selection);
    dispatch(receiveSelectionSocket(selection, gameId));
  });
  socket.on("nickname updated", (data: { id: string; nickname: string }) => {
    dispatch(nicknameUpdated(data));
  });

  const cleanup = () => {
    if (!socket) {
      return;
    }
    socket.removeAllListeners('game updated');
    socket.removeAllListeners('selection');
    socket.removeAllListeners('nickname updated');
  }
  return cleanup;
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

import { AppThunk } from "../../app/store";
import { updateGame } from "../gamelist/gamelistSlice";
import { QRCoord } from "../hexGrid/hexGrid";
import { Game } from "./game";
import { getOrderedTileSelectionCoords } from "./gameSelectors";
import { resetGame, selectTile, unselectTile } from "./gameSlice";
// import { getEmptyGame } from "./game";
// import { addGame } from "./gameSlice";

// export const createNewGame =
//   (userId: string): AppThunk =>
//   (dispatch) => {
//     const newGame = getEmptyGame(userId);
//     dispatch(addGame(newGame));
//   };

export const toggleTileSelected =
  (tile: QRCoord): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const selected = state.game.selectedTiles[tile] || false;
    if (selected) {
      dispatch(unselectTile(tile));
    } else {
      dispatch(selectTile(tile));
    }
  };

export const submitMove =
  (gameId: string): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const move = getOrderedTileSelectionCoords(state);

    const formattedCoords = move.map((coord: QRCoord) => {
      const [q, r] = coord.split(",");
      return {
        q: Number(q),
        r: Number(r),
      };
    });
    console.log("formattedCoords :", formattedCoords);

    try {
      const res = await fetch(`/api/game/${gameId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          move: formattedCoords,
        }),
      }).then((res) => res.json());

      const newGame: Game = {
        ...res,
        grid: res.grid.cellMap,
      };

      dispatch(
        updateGame({
          id: gameId,
          game: newGame,
        })
      );
      dispatch(resetGame());
    } catch (e) {
      console.log(e);
    }
  };

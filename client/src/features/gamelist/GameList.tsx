import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { refresh, createNewGame } from "./gamelistActions";

export function GameList() {
  const games = useAppSelector((state) => state.gamelist.games);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(refresh());
  }, [dispatch]);

  return (
    <div>
      <button
        onClick={() => {
          dispatch(createNewGame());
        }}
      >
        Create new
      </button>
      <button
        onClick={() => {
          dispatch(refresh());
        }}
      >
        refresh
      </button>
      <ul>
        {Object.entries(games).map(([id, game]) => (
          <li key={game.id}>{game.id}</li>
        ))}
      </ul>
    </div>
  );
}

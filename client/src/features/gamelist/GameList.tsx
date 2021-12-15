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
    <div className="mt-12">
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
          <li className="mx-2 my-1" key={game.id}>{game.id}</li>
        ))}
      </ul>
    </div>
  );
}

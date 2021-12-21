import React, { useEffect, useState } from "react";
import { Link, useMatch } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getUser } from "../user/userActions";
import { refresh, createNewGame, joinGameById } from "./gamelistActions";
import GameListItem from "./GameListItem";

export function GameList() {
  const games = useAppSelector((state) => state.gamelist.games);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(refresh());
    dispatch(getUser());
  }, [dispatch]);

  const homeMatch = useMatch("/");

  const [joinGameId, setJoinGameId] = useState("");
  return (
    <div style={{ width: "200px" }}>
      <div>
        <h3 className="text-2xl">Games</h3>
      </div>
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
      {!homeMatch && (
        <Link className="underline text-blue-800" to="/">
          home
        </Link>
      )}
      <ul>
        {Object.entries(games).map(([id, game]) => (
          <GameListItem key={id} gameId={id} />
        ))}
      </ul>
    </div>
  );
}

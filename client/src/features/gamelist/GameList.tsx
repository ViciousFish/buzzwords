import React, { useEffect, useState } from "react";
import { Link, useMatch } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getUser } from "../user/UserActions";
import { refresh, createNewGame, joinGameById } from "./gamelistActions";
import GameListItem from "./GameListItem";

export function GameList() {
  const games = useAppSelector((state) => state.gamelist.games);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(refresh());
    dispatch(getUser());
  }, [dispatch]);

  const homeMatch = useMatch("/")

  const [joinGameId, setJoinGameId] = useState('');
  return (
    <div className="mt-12">
      {/* <form onSubmit={(e) => {
        dispatch(joinGameById(joinGameId));
        setJoinGameId('')
        e.preventDefault();
      }}>
        <input type="text" value={joinGameId} onChange={e => setJoinGameId(e.target.value)}/>
        <button type="submit">join</button>
      </form> */}
      <h3 className="text-2xl">Games</h3>
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
      {!homeMatch && <Link className="underline text-blue-800" to="/">home</Link>}
      <ul>
        {Object.entries(games).map(([id, game]) => (
          <GameListItem key={id} gameId={id} />
        ))}
      </ul>
    </div>
  );
}

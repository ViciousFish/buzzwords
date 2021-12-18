import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getUser } from "../user/UserActions";
import { refresh, createNewGame, joinGameById } from "./gamelistActions";

export function GameList() {
  const games = useAppSelector((state) => state.gamelist.games);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(refresh());
    dispatch(getUser());
  }, [dispatch]);

  const [joinGameId, setJoinGameId] = useState('');
  return (
    <div className="mt-12">
      <form onSubmit={(e) => {
        dispatch(joinGameById(joinGameId));
        setJoinGameId('')
        e.preventDefault();
      }}>
        <input type="text" value={joinGameId} onChange={e => setJoinGameId(e.target.value)}/>
        <button type="submit">join</button>
      </form>
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
          <li className="mx-2 my-1 underline text-blue-800" key={game.id}>
            <Link to={`/play/${game.id}`}>{game.id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

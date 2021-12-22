import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useMatch } from "react-router-dom";
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
    <div style={{ width: "300px" }}>
      <div className="bg-darkbrown text-white p-3 rounded-br-md">
        <h3 className="text-2xl">Buzzwords</h3>
      </div>
      <div className="px-2">
        <NavLink
          className={({ isActive }) =>
            classNames(
              isActive
                ? "bg-primary hover:bg-opacity-100"
                : "underline text-blue-800",
              "p-2 rounded-md block hover:bg-primary hover:bg-opacity-50 my-1"
            )
          }
          to="/"
        >
          home
        </NavLink>
        <div className="">
          <span className="text-xl">Games</span>
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
        </div>
        <ul>
          {Object.entries(games).map(([id, game]) => (
            <GameListItem key={id} gameId={id} />
          ))}
          {Object.entries(games).length === 0 && <>No games</>}
        </ul>
      </div>
    </div>
  );
}

import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useMatch } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
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
    <div className="bg-darkbg inset-right" style={{ width: "300px" }}>
      {/* <div className="bg-primary text-darkbrown p-3 shadow  rounded-br-md">
        <h3 className="text-2xl">Buzzwords</h3>
      </div> */}
      <div className="px-2">
        <div className="flex">
          <NavLink
            className={({ isActive }) =>
              classNames(
                isActive
                  ? "bg-primary hover:bg-opacity-100"
                  : "underline text-darkbrown",
                "p-2 rounded-md flex-auto hover:bg-primary hover:bg-opacity-50 my-1 text-2xl"
              )
            }
            to="/"
          >
            Buzzwords
          </NavLink>
          <button className="p-2 hover:bg-primary hover:bg-opacity-50 rounded-md"><FontAwesomeIcon icon={faBars} /></button>
        </div>
        <div className="">
          <span className="text-xl">Games</span>
          <Button
            onClick={() => {
              dispatch(createNewGame());
            }}
          >
            Create new
          </Button>
          <Button
            onClick={() => {
              dispatch(refresh());
            }}
          >
            refresh
          </Button>
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

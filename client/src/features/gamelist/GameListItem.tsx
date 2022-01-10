import classNames from "classnames";
import React from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { getAllUsers } from "../user/userSelectors";
import { ClientGame } from "./gamelistSlice";

interface GameListItemProps {
  game: ClientGame;
}

const GameListItem: React.FC<GameListItemProps> = ({ game }) => {
  const allUsers = useAppSelector(getAllUsers);
  const { users } = game;
  const nick1 = allUsers[users[0]]?.nickname ?? "???";
  const nick2 = game.vsAI ? "Computer" : allUsers[users[1]]?.nickname ?? "???";
  return (
    <li className="my-1 whitespace-nowrap">
      <NavLink
        className={({ isActive }) =>
          classNames(
            isActive
              ? "bg-primary hover:bg-opacity-100"
              : "underline text-darkbrown",
            "p-2 rounded-xl block hover:bg-primary hover:bg-opacity-50 truncate",
            game.lastSeenTurn < game.moves.length ? "font-bold" : ""
          )
        }
        to={`/play/${game.id}`}
      >
        {nick1} vs {nick2}
      </NavLink>
    </li>
  );
};

export default GameListItem;

import classNames from "classnames";
import React from "react";
import { Link, NavLink, useMatch } from "react-router-dom";

interface GameListItemProps {
  gameId: string;
}

const GameListItem: React.FC<GameListItemProps> = ({ gameId }) => (
  <li className="my-1 whitespace-nowrap">
    <NavLink
      className={({ isActive }) =>
        classNames(
          isActive ? "bg-primary hover:bg-opacity-100" : "underline text-darkbrown",
          "p-2 rounded-md block hover:bg-primary hover:bg-opacity-50"
        )
      }
      to={`/play/${gameId}`}
    >
      {gameId}
    </NavLink>
  </li>
);

export default GameListItem;

import React from "react";
import classNames from "classnames";
import { NavLink } from "react-router-dom";

import { ShallowGame } from "buzzwords-shared/Game";
import { useAppSelector } from "../../app/hooks";
import { getAllUsers } from "../user/userSelectors";

interface GameListItemProps {
  game: ShallowGame;
}

const GameListItem: React.FC<GameListItemProps> = ({ game }) => {
  const allUsers = useAppSelector(getAllUsers);
  const userId = useAppSelector((state) => state.user.user?.id);

  const { users } = game;
  const nick1 = allUsers[users[0]]?.nickname ?? "???";
  const nick2 = game.vsAI ? "Computer" : allUsers[users[1]]?.nickname ?? "???";
  const selfIndex = users.findIndex((val) => val === userId);
  return (
    <li className="my-1 whitespace-nowrap text-sm">
      <NavLink
        className={({ isActive }) =>
          classNames(
            isActive ? "bg-beeYellow-400 hover:bg-opacity-100" : "",
            "p-2 rounded-xl block hover:bg-beeYellow-400 hover:bg-opacity-50 truncate",
            "flex items-center",
            game.turn === selfIndex && game.users.length === 2 && !game.gameOver
              ? "font-bold"
              : ""
          )
        }
        to={`/play/${game.id}`}
      >
        {({ isActive }) => (
          <>
            <span className="flex-auto">
              <span className={isActive ? "" : "underline"}>
                {nick1} vs {nick2}
              </span>
              {game.vsAI ? (
                <span className="text-textSubtle no-underline">
                  {" "}
                  ({game.difficulty})
                </span>
              ) : null}
            </span>
          </>
        )}
      </NavLink>
    </li>
  );
};

export default GameListItem;

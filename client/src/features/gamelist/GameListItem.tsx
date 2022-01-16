import { faDotCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  const userId = useAppSelector((state) => state.user.user?.id);

  const { users } = game;
  const nick1 = allUsers[users[0]]?.nickname ?? "???";
  const nick2 = game.vsAI ? "Computer" : allUsers[users[1]]?.nickname ?? "???";
  const selfIndex = users.findIndex((val) => val === userId);
  return (
    <li className="my-1 whitespace-nowrap">
      <NavLink
        className={({ isActive }) =>
          classNames(
            isActive ? "bg-primary hover:bg-opacity-100" : "text-darkbrown",
            "p-2 rounded-xl block hover:bg-primary hover:bg-opacity-50 truncate",
            "flex items-center",
            game.turn === selfIndex && game.users.length === 2
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
                <span className="text-gray-600 no-underline">
                  {" "}
                  ({game.difficulty})
                </span>
              ) : null}
            </span>
            {game.lastSeenTurn < game.moves.length && (
              <FontAwesomeIcon className="text-blue-500" icon={faDotCircle} />
            )}
          </>
        )}
      </NavLink>
    </li>
  );
};

export default GameListItem;

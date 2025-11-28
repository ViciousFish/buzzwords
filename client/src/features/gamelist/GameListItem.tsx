import React from "react";
import classNames from "classnames";
import { NavLink } from "react-router-dom";
import relativeDate from "tiny-relative-date";

import Game, { ShallowGame } from "buzzwords-shared/Game";
import { useAppSelector } from "../../app/hooks";
import { getAllUsers } from "../user/userSelectors";
import { isFullGame } from "./gamelistSlice";

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
  
  // Get last move info if available
  const fullGame = isFullGame(game) ? game : null;
  const lastMove = fullGame?.moves && fullGame.moves.length > 0 
    ? fullGame.moves[fullGame.moves.length - 1] 
    : null;
  const lastMovePlayer = lastMove 
    ? (lastMove.player === 0 ? nick1 : nick2)
    : null;
  const lastMoveDate = lastMove?.date 
    ? (lastMove.date instanceof Date ? lastMove.date : new Date(lastMove.date))
    : (game.updatedDate 
        ? (game.updatedDate instanceof Date ? game.updatedDate : new Date(game.updatedDate))
        : null);
  const lastMoveWord = lastMove?.letters ? lastMove.letters.join("").toUpperCase() : null;

  return (
    <li className="my-1 whitespace-nowrap text-sm">
      <NavLink
        className={({ isActive }) =>
          classNames(
            isActive ? "bg-primary hover:bg-opacity-100" : "",
            "p-2 rounded-xl block hover:bg-primary hover:bg-opacity-50 truncate",
            "flex items-center text-darkbrown",
          )
        }
        to={`/play/${game.id}`}
      >
        {({ isActive }) => (
          <>
            <div className="flex-auto min-w-0">
              <div className={classNames("flex items-center gap-2", game.turn === selfIndex && game.users.length === 2 && !game.gameOver ? "font-bold" : "")}>
                <span className={isActive ? "" : "underline"}>
                  {nick1} vs {nick2}
                </span>
                {game.vsAI && (
                  <span className="text-textSubtle no-underline flex-shrink-0">
                    ({game.difficulty})
                  </span>
                )}
              </div>
              <div className="text-xs text-textSubtle mt-0.5">
                {lastMovePlayer && lastMoveWord && (
                  <span>
                    <span>{lastMovePlayer}:</span> {lastMoveWord}
                    {lastMoveDate && ` • ${relativeDate(lastMoveDate)}`}
                  </span>
                )}
                {lastMovePlayer && !lastMoveWord && (
                  <span>
                    {lastMovePlayer} • Turn {game.turn}
                    {lastMoveDate && ` • ${relativeDate(lastMoveDate)}`}
                  </span>
                )}
                {!lastMovePlayer && game.turn > 1 && (
                  <span>Turn {game.turn}</span>
                )}
                {!lastMovePlayer && game.turn === 1 && lastMoveDate && (
                  <span>{relativeDate(lastMoveDate)}</span>
                )}
              </div>
            </div>
          </>
        )}
      </NavLink>
    </li>
  );
};

export default GameListItem;

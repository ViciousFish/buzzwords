import React from "react";
import classNames from "classnames";
import { NavLink } from "react-router-dom";
import relativeDate from "tiny-relative-date";
import { LocalBotGameState } from "../bgio-board/localBotSlice";

interface LocalBotGameListItemProps {
  game: LocalBotGameState;
  isActive: boolean;
}

const LocalBotGameListItem: React.FC<LocalBotGameListItemProps> = ({
  game,
  isActive,
}) => {
  const isYourTurn = game.currentPlayer === 0 && !game.gameover;
  const opponentName = "Computer";
  const lastMove = game.moves.length > 0 ? game.moves[game.moves.length - 1] : null;
  const lastMovePlayer = lastMove ? (lastMove.player === 0 ? "You" : opponentName) : null;
  const lastMoveDate = lastMove?.date ? new Date(lastMove.date) : null;
  console.log('lastMove', lastMove)
  const lastMoveWord = lastMove?.letters ? lastMove.letters.join("").toUpperCase() : null;
  console.log('lastMoveWord', lastMoveWord);

  return (
    <li className="my-1 whitespace-nowrap text-sm">
      <NavLink
        className={({ isActive: navIsActive }) =>
          classNames(
            navIsActive || isActive ? "bg-primary hover:bg-opacity-100" : "",
            "p-2 rounded-xl block hover:bg-primary hover:bg-opacity-50 truncate",
            "flex items-center text-darkbrown",
          )
        }
        to={`/local/${game.id}`}
      >
        {({ isActive: navIsActive }) => (
          <>
            <div className="flex-auto min-w-0">
              <div className="flex items-center gap-2">
                <span className={classNames(navIsActive || isActive ? "" : "underline", game.currentPlayer === 0 && !game.gameover ? "font-bold" : "")}>
                  You vs {opponentName}
                </span>
                {game.isTutorial ? (
                  <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-primary text-darkbrown flex-shrink-0">
                    Tutorial
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-primary text-darkbrown flex-shrink-0">
                    {game.difficulty}
                  </span>
                )}
                {game.gameover && (
                  <span className="text-textSubtle no-underline flex-shrink-0">
                    - {game.winner === "0" ? "Won" : "Lost"}
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
              </div>
            </div>
          </>
        )}
      </NavLink>
    </li>
  );
};

export default LocalBotGameListItem;


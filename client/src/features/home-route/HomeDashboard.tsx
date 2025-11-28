import React, { useMemo, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import GameListItem from "../gamelist/GameListItem";
import LocalBotGameListItem from "../gamelist/LocalBotGameListItem";
import Game, { ShallowGame } from "buzzwords-shared/Game";
import { LocalBotGameState } from "../bgio-board/localBotSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import relativeDate from "tiny-relative-date";
import GamePreviewCard from "./GamePreviewCard";
import { isFullGame } from "../gamelist/gamelistSlice";
import {
  FancyButton,
  FancyButtonVariant,
} from "../../presentational/FancyButton";
import { useNavigate } from "react-router-dom";

interface GameWithMetadata {
  id: string;
  isLocal: boolean;
  isYourTurn: boolean;
  lastMoveDate: Date | null;
  game: ShallowGame | LocalBotGameState;
}

const HomeDashboard: React.FC = () => {
  const localBotState = useAppSelector((state) => state.localBot);
  const onlineGames = useAppSelector((state) => state.gamelist.games);
  const userId = useAppSelector((state) => state.user.user?.id);
  const [showFinishedGames, setShowFinishedGames] = useState(false);
  const navigate = useNavigate();

  // Collect and sort all unfinished games with grid data (local and online)
  const unfinishedGamesWithGrid = useMemo(() => {
    const games: Array<{
      id: string;
      isLocal: boolean;
      game: LocalBotGameState | Game;
      isYourTurn: boolean;
      lastMoveDate: Date | null;
    }> = [];

    // Add local bot games
    Object.values(localBotState.games).forEach((game) => {
      if (!game.gameover) {
        const isYourTurn = game.currentPlayer === 0;
        const lastMove =
          game.moves.length > 0 ? game.moves[game.moves.length - 1] : null;
        const lastMoveDate = lastMove?.date ? new Date(lastMove.date) : null;

        games.push({
          id: game.id,
          isLocal: true,
          game,
          isYourTurn,
          lastMoveDate,
        });
      }
    });

    // Add online games that have full game data (with grid)
    Object.values(onlineGames).forEach((game) => {
      if (!game.gameOver && isFullGame(game)) {
        const selfIndex = game.users.findIndex((val) => val === userId);
        const isYourTurn = game.turn === selfIndex && game.users.length === 2;

        let lastMoveDate: Date | null = null;
        if (game.moves && game.moves.length > 0) {
          const lastMove = game.moves[game.moves.length - 1];
          lastMoveDate = lastMove?.date
            ? lastMove.date instanceof Date
              ? lastMove.date
              : new Date(lastMove.date)
            : null;
        } else if (game.updatedDate) {
          lastMoveDate =
            game.updatedDate instanceof Date
              ? game.updatedDate
              : new Date(game.updatedDate);
        } else if (game.createdDate) {
          lastMoveDate =
            game.createdDate instanceof Date
              ? game.createdDate
              : new Date(game.createdDate);
        }

        games.push({
          id: game.id,
          isLocal: false,
          game,
          isYourTurn,
          lastMoveDate,
        });
      }
    });

    // Sort: your turn games first, then by most recent move
    return games.sort((a, b) => {
      // Your turn games first
      if (a.isYourTurn && !b.isYourTurn) return -1;
      if (!a.isYourTurn && b.isYourTurn) return 1;

      // Then by most recent move (newest first)
      if (a.lastMoveDate && b.lastMoveDate) {
        return b.lastMoveDate.getTime() - a.lastMoveDate.getTime();
      }
      if (a.lastMoveDate) return -1;
      if (b.lastMoveDate) return 1;

      return 0;
    });
  }, [localBotState.games, onlineGames, userId]);

  // Collect and sort finished games
  const finishedGames = useMemo(() => {
    const games: GameWithMetadata[] = [];

    // Add local bot games
    Object.values(localBotState.games).forEach((game) => {
      if (game.gameover) {
        const lastMove =
          game.moves.length > 0 ? game.moves[game.moves.length - 1] : null;
        const lastMoveDate = lastMove?.date ? new Date(lastMove.date) : null;

        games.push({
          id: game.id,
          isLocal: true,
          isYourTurn: false,
          lastMoveDate,
          game,
        });
      }
    });

    // Add online games
    Object.values(onlineGames).forEach((game) => {
      if (game.gameOver) {
        // For online games, use updatedDate if available, otherwise createdDate
        let lastMoveDate: Date | null = null;
        if (game.updatedDate) {
          lastMoveDate =
            game.updatedDate instanceof Date
              ? game.updatedDate
              : new Date(game.updatedDate);
        } else if (game.createdDate) {
          lastMoveDate =
            game.createdDate instanceof Date
              ? game.createdDate
              : new Date(game.createdDate);
        }

        games.push({
          id: game.id,
          isLocal: false,
          isYourTurn: false,
          lastMoveDate,
          game,
        });
      }
    });

    // Sort by most recent move (newest first)
    return games.sort((a, b) => {
      if (a.lastMoveDate && b.lastMoveDate) {
        return b.lastMoveDate.getTime() - a.lastMoveDate.getTime();
      }
      if (a.lastMoveDate) return -1;
      if (b.lastMoveDate) return 1;
      return 0;
    });
  }, [localBotState.games, onlineGames]);

  return (
    <div className="flex flex-col min-h-full p-4 overflow-y-auto">
      {/* Welcome Section - Always show */}
      <div className="flex flex-col md:flex-row flex-shrink-0 items-center gap-4 text-center">
        <h1 className="text-[4vh] font-bold text-darkbrown mb-2">
          Welcome to{" "}
          <span className="font-fredoka uppercase text-nowrap">
            <img
              className="inline drop-shadow mb-1 ml-1 relative bottom-1"
              style={{ width: "4vh", aspectRatio: "1" }}
              src="/bee.png"
            />{" "}
            Buzzwords
          </span>
        </h1>
        <FancyButton
          className="text-lg px-4 py-2 font-bold"
          variant={FancyButtonVariant.Sunset}
          onPress={() => navigate("/play")}
        >
          New Game
        </FancyButton>
      </div>

      {/* Active Games - Preview Cards */}
      {unfinishedGamesWithGrid.length === 0 ? (
        <div className="text-text mb-4 text-center">
          <p>No active games yet.</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-darkbrown mb-4">
            Active Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {unfinishedGamesWithGrid.slice(0, 8).map((gameData) => (
              <GamePreviewCard
                key={gameData.id}
                gameId={gameData.id}
                isLocal={gameData.isLocal}
                game={gameData.game}
              />
            ))}
          </div>
        </>
      )}

      {/* Finished Games Section */}
      {finishedGames.length > 0 && (
        <>
          <button
            className="flex items-center text-darkbrown w-full mb-2"
            onClick={() => setShowFinishedGames(!showFinishedGames)}
          >
            <FontAwesomeIcon
              className="mr-1"
              icon={showFinishedGames ? faAngleDown : faAngleRight}
            />
            <h2 className="inline text-xl font-semibold">Finished Games</h2>
          </button>
          {showFinishedGames && (
            <ul className="space-y-2">
              {finishedGames.map((gameWithMeta) => {
                const game = gameWithMeta.game;
                const lastMoveDate = gameWithMeta.lastMoveDate;

                return (
                  <li key={gameWithMeta.id} className="space-y-1">
                    {gameWithMeta.isLocal ? (
                      <LocalBotGameListItem
                        game={game as LocalBotGameState}
                        isActive={false}
                      />
                    ) : (
                      <GameListItem game={game as ShallowGame} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default HomeDashboard;

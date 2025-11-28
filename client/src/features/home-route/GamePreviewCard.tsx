import React from "react";
import { NavLink } from "react-router-dom";
import classNames from "classnames";
import relativeDate from "tiny-relative-date";
import Canvas from "../canvas/Canvas";
import { GameBoardTiles } from "../game/GameBoardTiles";
import { LocalBotGameState } from "../bgio-board/localBotSlice";
import Game, { ShallowGame } from "buzzwords-shared/Game";
import { isFullGame } from "../gamelist/gamelistSlice";
import { useAppSelector } from "../../app/hooks";
import { getAllUsers } from "../user/userSelectors";
import { getGameUrl } from "../play-game-route/PlayGame";
import CopyToClipboard from "../../presentational/CopyToClipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faShareSquare } from "@fortawesome/free-solid-svg-icons";
import { ActionButton } from "../../presentational/ActionButton";
import QRCode from "react-qr-code";

interface GamePreviewCardProps {
  gameId: string;
  isLocal: boolean;
  game: LocalBotGameState | ShallowGame | Game;
}

const GamePreviewCard: React.FC<GamePreviewCardProps> = ({
  gameId,
  isLocal,
  game,
}) => {
  const allUsers = useAppSelector(getAllUsers);
  const userId = useAppSelector((state) => state.user.user?.id);

  // Extract data based on game type
  let grid: any = null;
  let currentTurn: 0 | 1 = 0;
  let isGameOver = false;
  let turn = 0;
  let player1Name = "";
  let player2Name = "";
  let isYourTurn = false;
  let selfPlayerIndex: number | null = null;
  let recentMoves: Array<{
    player: string;
    word: string | null;
    date: Date | null;
    playerIndex: 0 | 1;
  }> = [];
  let badge: string | null = null;
  let gameOverStatus: string | null = null;
  let isOnline = !isLocal;
  let isVsBot = false;
  let needsOpponent = false;

  if (isLocal) {
    const localGame = game as LocalBotGameState;
    grid = localGame.grid;
    currentTurn = localGame.currentPlayer;
    isGameOver = localGame.gameover;
    turn = localGame.turn;
    player1Name = "You";
    player2Name = "Computer";
    isYourTurn = localGame.currentPlayer === 0 && !localGame.gameover;
    selfPlayerIndex = 0; // In local games, player 0 is always "You"
    isVsBot = true; // Local games are always vs bot

    // Get last 3 moves
    const moves = localGame.moves || [];
    recentMoves = moves
      .slice(-3)
      .map((move) => ({
        player: move.player === 0 ? "You" : "Computer",
        word: move.letters ? move.letters.join("").toUpperCase() : null,
        date: move.date ? new Date(move.date) : null,
        playerIndex: move.player,
      }));

    badge = localGame.isTutorial ? "Tutorial" : `Level ${localGame.difficulty} Bot`;

    if (localGame.gameover) {
      gameOverStatus = localGame.winner === "0" ? "Won" : "Lost";
    }
  } else {
    const onlineGame = game as Game | ShallowGame;

    // Only show preview if we have full game data with grid
    if (!isFullGame(onlineGame)) {
      return null;
    }

    grid = onlineGame.grid;
    currentTurn = onlineGame.turn;
    isGameOver = onlineGame.gameOver;
    turn = onlineGame.turn;

    const { users } = onlineGame;
    player1Name = allUsers[users[0]]?.nickname ?? "???";
    player2Name = onlineGame.vsAI
      ? "Computer"
      : allUsers[users[1]]?.nickname ?? "???";
    isVsBot = onlineGame.vsAI || false;
    needsOpponent = !onlineGame.vsAI && users.length === 1;

    const selfIndex = users.findIndex((val) => val === userId);
    selfPlayerIndex = selfIndex >= 0 ? selfIndex : null;
    isYourTurn =
      onlineGame.turn === selfIndex &&
      users.length === 2 &&
      !onlineGame.gameOver;

    // Get last 3 moves
    const moves = onlineGame.moves || [];
    recentMoves = moves
      .slice(-3)
      .reverse()
      .map((move) => ({
        player: move.player === 0 ? player1Name : player2Name,
        word: move.letters ? move.letters.join("").toUpperCase() : null,
        date: move.date
          ? move.date instanceof Date
            ? move.date
            : new Date(move.date)
          : null,
        playerIndex: move.player,
      }));

    if (onlineGame.vsAI) {
      badge = `Level ${onlineGame.difficulty.toString()} Bot`;
    }

    if (onlineGame.gameOver && onlineGame.winner !== null) {
      gameOverStatus = onlineGame.winner === selfIndex ? "Won" : "Lost";
    }
  }

  // If we don't have grid data, don't render
  if (!grid) {
    return null;
  }

  const linkTo = isLocal ? `/local/${gameId}` : `/play/${gameId}`;
  const gameUrl = !isLocal ? getGameUrl(gameId) : null;

  return (
    <div className="bg-darkbg rounded-lg overflow-hidden hover:shadow-lg transition-shadow border border-primary border-opacity-30 flex flex-col">
      <NavLink to={linkTo} className="flex flex-col flex-1">
        <div className="p-3 flex flex-col gap-2">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {badge && (
                <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-slate-200/70 text-darkbrown flex-shrink-0">
                  {badge}
                </span>
              )}
              {!isVsBot && (
                <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-slate-200/70 text-darkbrown flex-shrink-0">
                  PvP
                </span>
              )}
              <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-slate-200/70 text-darkbrown flex-shrink-0">
                {isOnline ? "Online" : "Offline"}
              </span>

              {gameOverStatus && (
                <span className="text-xs text-textSubtle no-underline flex-shrink-0">
                  - {gameOverStatus}
                </span>
              )}
            </div>
            <span
              className={classNames(
                "text-md text-textInverse bg-darkbrown px-2 py-1 rounded-lg",
                isYourTurn ? "font-bold" : ""
              )}
            >
              {player1Name} vs {player2Name}
            </span>
          </div>
          {needsOpponent && gameUrl ? (
            <div className="flex align-self-center flex-col gap-3 p-4 bg-lighterbg rounded-lg">
              <span className="text-xs font-medium text-text text-center">
                No opponent yet! Scan this invite code
              </span>
              <div className="flex items-center justify-center w-full">
                <QRCode
                  className="bg-white p-4 rounded-lg border-4 border-darkbrown"
                  value={gameUrl}
                  bgColor="white"
                  fgColor="#2D1810"
                  size={180}
                />
              </div>
              <div className="text-xs text-center text-textSubtle">
                or send this invite link
              </div>
              <div
                className="flex gap-2 items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex-1 border-2 border-darkbrown/30 bg-white rounded px-3 py-2 text-xs overflow-hidden min-w-0">
                  <a
                    href={gameUrl}
                    className="text-textLink underline break-all block truncate"
                    onClick={(e) => e.stopPropagation()}
                    title={gameUrl}
                  >
                    {gameUrl}
                  </a>
                </div>
                <CopyToClipboard
                  label={<FontAwesomeIcon icon={faClipboard} />}
                  text={gameUrl}
                />
                {navigator.share && (
                  <button
                    type="button"
                    className="px-3 py-2 rounded bg-primary text-darkbrown hover:bg-primary/90 transition-colors flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.share?.({
                        url: gameUrl,
                      });
                    }}
                  >
                    <FontAwesomeIcon icon={faShareSquare} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="aspect-square relative bg-opacity-10">
              <Canvas isGameboard>
                <GameBoardTiles
                  grid={grid}
                  revealLetters
                  enableSelection={false}
                  selection={[]}
                  currentTurn={currentTurn}
                  onToggleTile={() => {}}
                  position={[0, 0, 0]}
                  tutorialOnlyShowStartingTiles={false}
                />
              </Canvas>
            </div>
          )}
          {recentMoves.length > 0 ? (
            <div className="flex flex-col gap-1.5 max-h-32 overflow-hidden">
              {recentMoves.map((move, index) => {
                const isFromSelf =
                  selfPlayerIndex !== null &&
                  move.playerIndex === selfPlayerIndex;

                return (
                  <div
                    key={index}
                    className={classNames(
                      "flex flex-col gap-0.5",
                      isFromSelf ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={classNames(
                        "px-3 py-1 rounded-lg text-xs max-w-[80%]",
                        move.playerIndex === 0 ? "bg-p1" : "bg-p2"
                      )}
                    >
                      {move.word ? (
                        <div className="font-medium">{move.word}</div>
                      ) : (
                        <div className="text-[10px] opacity-60 italic">
                          Pass
                        </div>
                      )}
                    </div>
                    {move.date && (
                      <div
                        className={classNames(
                          "text-[9px] text-textSubtle px-1",
                          isFromSelf ? "text-right" : "text-left"
                        )}
                      >
                        {relativeDate(move.date)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-textSubtle">
              {turn > 1 && <span>Turn {turn}</span>}
              {turn === 1 && <span>New game</span>}
            </div>
          )}
        </div>
      </NavLink>
    </div>
  );
};

export default GamePreviewCard;

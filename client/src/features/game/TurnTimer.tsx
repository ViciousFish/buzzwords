import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import Game from "buzzwords-shared/Game";
import { useAppDispatch } from "../../app/hooks";
import { checkTimeout } from "../gamelist/gamelistActions";

function formatMs(ms: number): string {
  if (ms <= 0) return "0s";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (days === 0) parts.push(`${seconds}s`); // always show seconds unless we have days
  return parts.join(" ");
}

interface TurnTimerProps {
  game: Game;
  userIndex: number | null;
}

const TurnTimer: React.FC<TurnTimerProps> = ({ game, userIndex }) => {
  const dispatch = useAppDispatch();
  const [, forceUpdate] = useState(0);
  const timeoutCalledRef = useRef(false);

  useEffect(() => {
    if (!game.timerConfig || !game.timerStartedAt || game.gameOver) return;
    timeoutCalledRef.current = false;
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
      // Check if the active player's time has run out
      const elapsed = Date.now() - game.timerStartedAt!;
      const remaining = (game.timeRemaining?.[game.turn] ?? 0) - elapsed;
      if (remaining <= 0 && !timeoutCalledRef.current) {
        timeoutCalledRef.current = true;
        dispatch(checkTimeout(game.id));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [game.timerStartedAt, game.turn, game.gameOver, game.id, dispatch]);

  if (!game.timerConfig || !game.timeRemaining) return null;

  const getDisplayMs = (playerIdx: 0 | 1): number => {
    const base = game.timeRemaining![playerIdx];
    if (playerIdx === game.turn && game.timerStartedAt && !game.gameOver) {
      return Math.max(0, base - (Date.now() - game.timerStartedAt));
    }
    return Math.max(0, base);
  };

  const p0Ms = getDisplayMs(0);
  const p1Ms = getDisplayMs(1);

  const renderTimer = (playerIdx: 0 | 1, ms: number) => {
    const isActive = playerIdx === game.turn && !game.gameOver;
    const isRunning = isActive && Boolean(game.timerStartedAt);
    const isLow = ms < 10_000;
    const isMine = playerIdx === userIndex;

    return (
      <div
        key={playerIdx}
        className={classNames(
          "flex flex-col items-center px-2",
          playerIdx === 0 ? "text-p1" : "text-p2"
        )}
      >
        <span
          className={classNames(
            "font-mono font-bold tabular-nums",
            isLow && isRunning ? "text-red-500" : "",
            isActive ? "text-base" : "text-sm opacity-60"
          )}
        >
          {formatMs(ms)}
        </span>
        {isActive && !isRunning && !game.gameOver && (
          <span className="text-[10px] opacity-50">{isMine ? "press start" : "waiting"}</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-1 px-2">
      {renderTimer(0, p0Ms)}
      <span className="text-textInverse opacity-30 text-xs">|</span>
      {renderTimer(1, p1Ms)}
    </div>
  );
};

export default TurnTimer;

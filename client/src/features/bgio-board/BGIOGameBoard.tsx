import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import Canvas from "../canvas/Canvas";
import { GameBoardTiles } from "../game/GameBoardTiles";
import { BGIOStatusArea } from "./BGIOStatusArea";
import { TurnHistory } from "./TurnHistory";
import { updateSelection } from "./localBotSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
import useBreakpoint from "use-breakpoint";
import { BREAKPOINTS } from "../../app/MainGameStructure";
import classNames from "classnames";
import { animated as a, useTransition, useSpring } from "@react-spring/web";
import { use100vh } from "react-div-100vh";

interface BGIOGameBoardProps {
  gameId: string;
}

export function BGIOGameBoard({ gameId }: BGIOGameBoardProps) {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.localBot.games[gameId]);
  const { breakpoint } = useBreakpoint(BREAKPOINTS);
  const isMobile = breakpoint === "xs" || breakpoint === "sm";
  const isDesktop = breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl";
  const lowPowerMode = useAppSelector(({ settings }) => settings.lowPowerMode);
  const [isTurnHistoryOpen, setIsTurnHistoryOpen] = useState(false);

  if (!game) {
    return <div>Game not found</div>;
  }

  const hasMoves = game.moves && game.moves.length > 0;

  // Animate initial slide-in from right when hasMoves becomes true
  // This only runs once when the container first appears
  const initialSlideTransition = useTransition(hasMoves && isDesktop, {
    from: { transform: "translateX(100%)", opacity: 0 },
    enter: { transform: "translateX(0%)", opacity: 1 },
    leave: { transform: "translateX(100%)", opacity: 0 },
    config: {
      tension: 200,
      clamp: true,
    },
    immediate: lowPowerMode,
  });

  const handleToggleTile = (coord: string) => {
    const [q, r] = coord.split(",").map(Number);
    const index = game.selection.findIndex((x) => x.q === q && x.r === r);
    const newSelection = [...game.selection];
    if (index > -1) {
      newSelection.splice(index, 1);
    } else {
      newSelection.push({ q, r });
    }
    dispatch(updateSelection({ gameId, selection: newSelection }));
  };

  if (!game) {
    return null;
  }

  const handleToggleTurnHistory = () => {
    setIsTurnHistoryOpen(!isTurnHistoryOpen);
  };

  const handleCloseTurnHistory = () => {
    setIsTurnHistoryOpen(false);
  };

  // Backdrop transition for mobile
  const backdropTransition = useTransition(isTurnHistoryOpen && isMobile, {
    from: { opacity: 0 },
    enter: { opacity: 0.5 },
    leave: { opacity: 0 },
    config: {
      tension: 200,
      clamp: true,
    },
    immediate: lowPowerMode,
  });

  // Mobile turn history slide-up animation
  const mobileTurnHistoryTransition = useTransition(isTurnHistoryOpen && isMobile && hasMoves, {
    from: { transform: "translateY(100vh)", opacity: 0 },
    enter: { transform: "translateY(0%)", opacity: 1 },
    leave: { transform: "translateY(100vh)", opacity: 0 },
    config: {
      tension: 200,
      friction: 25,
    },
    immediate: lowPowerMode,
  });

  return (
    <>
      <div className="flex flex-col lg:flex-row flex-auto items-stretch">
        <div className="flex-auto flex flex-col">
          <BGIOStatusArea gameId={gameId} />
          <div className="flex-auto relative px-4 min-h-0 basis-0 lg:min-w-0">
            <Canvas isGameboard>
              <GameBoardTiles
                tutorialOnlyShowStartingTiles={game.isTutorial && game.turn === 1}
                tutorialDoStaggeredReveal={game.isTutorial && game.turn > 1 && game.moves.length > 0}
                revealLetters
                enableSelection={game.currentPlayer === 0 && !game.gameover}
                onToggleTile={handleToggleTile}
                grid={game.grid}
                selection={game.selection}
                currentTurn={game.currentPlayer}
              />
            </Canvas>
          </div>
        </div>
        {/* Desktop TurnHistory with slide-in animation */}
        {initialSlideTransition(
          (slideStyles, show) =>
            show && (
              <a.div
                className="hidden lg:flex flex-shrink-0 min-h-0"
                style={slideStyles as React.CSSProperties}
              >
                <TurnHistory gameId={gameId} onClose={() => {}} />
              </a.div>
            )
        )}
      </div>

      {/* Mobile floating button */}
      {hasMoves && isMobile && (
        <button
          onClick={handleToggleTurnHistory}
          className="fixed bottom-4 right-4 z-30 bg-darkbrown text-lightbg p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-opacity"
          aria-label="Open turn history"
        >
          <FontAwesomeIcon icon={faHistory} className="text-xl" />
        </button>
      )}

      {/* Mobile backdrop */}
      {backdropTransition(
        (styles, show) =>
          show && (
            <a.div
              className="fixed inset-0 bg-black z-30"
              style={styles}
              onClick={handleCloseTurnHistory}
            />
          )
      )}

      {/* Mobile turn history overlay with slide-up animation */}
      {mobileTurnHistoryTransition(
        (styles, show) =>
          show && (
            <a.div
              className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
              style={styles as React.CSSProperties}
            >
              <div className="w-full pointer-events-auto">
                <TurnHistory gameId={gameId} onClose={handleCloseTurnHistory} />
              </div>
            </a.div>
          )
      )}
    </>
  );
}

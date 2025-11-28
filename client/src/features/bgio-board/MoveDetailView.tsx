import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { clearViewedMove, setViewedMoveIndex } from "./localBotSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faBook,
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import axios from "axios";
import Canvas from "../canvas/Canvas";
import { GameBoardTiles } from "../game/GameBoardTiles";
import { LocalBotMove } from "./localBotSlice";
import HexGrid from "buzzwords-shared/hexgrid";
import { animated as a, useTransition } from "@react-spring/web";

interface MoveDetailViewProps {
  gameId: string;
  move: LocalBotMove;
  moveIndex: number;
  allMoves: LocalBotMove[];
  previousMoveIndex: number | null;
}

interface WordDefinitionContentProps {
  move: LocalBotMove;
  word: string | null;
  isPass: boolean;
  moveIndex: number;
  styles: any;
}

// Component that manages its own dictionary data for each transition item
function WordDefinitionContent({
  move,
  word,
  isPass,
  moveIndex,
  styles,
}: WordDefinitionContentProps) {
  const [dictionaryData, setDictionaryData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (word && !isPass) {
      setIsLoading(true);
      setDictionaryData(null);
      axios
        .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
          withCredentials: false,
        })
        .then((res) => {
          setDictionaryData(res.data);
          setIsLoading(false);
        })
        .catch((e) => {
          setDictionaryData({
            type: "error",
            status: e.response?.status,
          });
          setIsLoading(false);
        });
    }
  }, [word, isPass]);

  return (
    <a.div
      className="absolute inset-0 px-0 py-0 space-y-4"
      style={styles}
    >
      {isPass ? (
        <div className="text-center py-8">
          <div className="text-sm opacity-70 italic">Pass</div>
        </div>
      ) : (
        <>
          <div className="text-center">
            <div
              className={classNames(
                "inline-block px-6 py-3 rounded-lg text-2xl font-bold shadow-md",
                move.player === 0 ? "bg-p1" : "bg-p2"
              )}
            >
              {word?.toUpperCase()}
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center p-4">
              <FontAwesomeIcon className="mr-2" icon={faBook} />
              <FontAwesomeIcon className="animate-spin" icon={faSpinner} />
            </div>
          )}

          {dictionaryData && (
            <>
              {dictionaryData.type === "error" && (
                <div className="flex justify-center p-4 gap-1 items-center">
                  <FontAwesomeIcon className="mr-1" icon={faBook} />
                  <FontAwesomeIcon
                    className="mr-1"
                    icon={faExclamationTriangle}
                  />
                  {dictionaryData.status}
                </div>
              )}
              {dictionaryData.type !== "error" && (
                <div className="space-y-3">
                  {/* @ts-ignore */}
                  {dictionaryData[0]?.meanings?.map((meaning, index) => {
                    return (
                      <div key={index} className="border-b border-lightbg pb-3 last:border-b-0">
                        <p className="text-sm font-serif">
                          <span className="italic mr-2 opacity-75">
                            {meaning.partOfSpeech}
                          </span>
                          {meaning.definitions
                            .map((def: any) => def.definition)
                            .join(" / ")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </a.div>
  );
}

export function MoveDetailView({
  gameId,
  move,
  moveIndex,
  allMoves,
  previousMoveIndex,
}: MoveDetailViewProps) {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.localBot.games[gameId]);
  const lowPowerMode = useAppSelector(({ settings }) => settings.lowPowerMode);

  const word =
    move.letters && move.letters.length > 0
      ? move.letters.join("").toLowerCase()
      : null;
  const isPass = !word || move.pass;

  // The move.grid now stores the pre-move state directly
  // For the first move, we need the initial grid (before any moves)
  // For subsequent moves, move.grid is already the pre-move state
  const gridBeforeMove = useMemo(() => {
    if (moveIndex === 0) {
      // For the first move, we need to get the initial grid
      // We can reconstruct it by working backwards, or use the current game's grid
      // and work backwards through all moves. Actually, the simplest is to use
      // the game's current grid and apply all moves in reverse... but that's complex.
      // Actually, since move.grid is now pre-move, for the first move it should be
      // the initial grid. But wait - if it's the first move, move.grid would be
      // game.grid before the first move, which is the initial grid. So we can just use move.grid!
      return move.grid;
    } else {
      // For subsequent moves, move.grid is the pre-move state
      return move.grid;
    }
  }, [moveIndex, move]);

  const handleBack = useCallback(() => {
    dispatch(clearViewedMove({ gameId }));
  }, [dispatch, gameId]);

  const handlePrevious = useCallback(() => {
    if (moveIndex > 0) {
      dispatch(setViewedMoveIndex({ gameId, moveIndex: moveIndex - 1 }));
    }
  }, [dispatch, gameId, moveIndex]);

  const handleNext = useCallback(() => {
    if (moveIndex < allMoves.length - 1) {
      dispatch(setViewedMoveIndex({ gameId, moveIndex: moveIndex + 1 }));
    }
  }, [dispatch, gameId, moveIndex, allMoves.length]);

  const canGoPrevious = moveIndex > 0;
  const canGoNext = moveIndex < allMoves.length - 1;

  // Determine slide direction for word/definition animation
  const getSlideDirection = () => {
    if (previousMoveIndex === null) {
      return "right"; // Default to sliding in from right
    }
    // When going forward (to later moves), slide from right
    // When going backward (to earlier moves), slide from left
    return moveIndex > previousMoveIndex ? "right" : "left";
  };

  // Animate word/definition section sliding left/right
  // Pass the move object as the transition item so each transition carries its own data
  const wordDefinitionTransition = useTransition(move, {
    key: moveIndex,
    from: () => {
      const direction = getSlideDirection();
      return {
        transform: direction === "right" ? "translateX(100%)" : "translateX(-100%)",
      };
    },
    enter: {
      transform: "translateX(0%)",
    },
    leave: () => {
      const direction = getSlideDirection();
      // Exit in opposite direction
      return {
        transform: direction === "right" ? "translateX(-100%)" : "translateX(100%)",
      };
    },
    config: {
      tension: 200,
      friction: 25,
    },
    trail: 0, // Start enter immediately, don't wait for leave
    immediate: lowPowerMode,
  });

  return (
    <div className="flex flex-col h-full min-h-0 w-80 bg-darkbg">
      {/* Static Header */}
      <div className="flex-shrink-0 px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-1 hover:bg-lightbg hover:bg-opacity-50 rounded transition-colors"
          aria-label="Back to turn history"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-darkbrown" />
        </button>
        <h3 className="text-lg font-bold text-darkbrown flex-1">
          Move {moveIndex + 1}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className={classNames(
              "p-1 hover:bg-lightbg hover:bg-opacity-50 rounded transition-colors",
              !canGoPrevious && "opacity-30 cursor-not-allowed"
            )}
            aria-label="Previous move"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-darkbrown" />
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={classNames(
              "p-1 hover:bg-lightbg hover:bg-opacity-50 rounded transition-colors",
              !canGoNext && "opacity-30 cursor-not-allowed"
            )}
            aria-label="Next move"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-darkbrown" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        {/* Static Board View - only show if not a pass */}
        {!isPass && (
          <div className="flex-shrink-0 h-80 px-4 py-3">
            <Canvas isGameboard>
              <GameBoardTiles
                grid={gridBeforeMove}
                revealLetters
                enableSelection={false}
                onToggleTile={() => {}}
                selection={move.coords || []}
                currentTurn={move.player}
              />
            </Canvas>
          </div>
        )}

        {/* Animated Word and Definition Section */}
        <div className="flex-1 px-4 py-3 relative overflow-hidden">
          {wordDefinitionTransition((styles, transitionMove) => {
            // Use data from the transition item, not the current props
            const transitionWord =
              transitionMove.letters && transitionMove.letters.length > 0
                ? transitionMove.letters.join("").toLowerCase()
                : null;
            const transitionIsPass = !transitionWord || !!transitionMove.pass;
            
            return (
              <WordDefinitionContent
                move={transitionMove}
                word={transitionWord}
                isPass={transitionIsPass}
                moveIndex={moveIndex}
                styles={styles}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}


import React, { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import classNames from "classnames";
import relativeDate from "tiny-relative-date";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { animated as a, useTransition } from "@react-spring/web";
import { setViewedMoveIndex } from "./localBotSlice";
import { MoveDetailView } from "./MoveDetailView";
import useBreakpoint from "use-breakpoint";
import { BREAKPOINTS } from "../../app/MainGameStructure";
import { use100vh } from "react-div-100vh";

interface TurnHistoryProps {
  gameId: string;
  onClose: () => void;
}

export function TurnHistory({ gameId, onClose }: TurnHistoryProps) {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.localBot.games[gameId]);
  const viewedMoveIndex = game?.viewedMoveIndex ?? null;
  const lowPowerMode = useAppSelector(({ settings }) => settings.lowPowerMode);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousMoveIndexRef = useRef<number | null>(null);
  const { breakpoint } = useBreakpoint(BREAKPOINTS);
  const isDesktop = breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl";

  // Auto-scroll to bottom when new moves are added (only if not viewing a move)
  useEffect(() => {
    if (scrollContainerRef.current && viewedMoveIndex === null) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [game?.moves?.length, viewedMoveIndex]);

  if (!game) {
    return null;
  }

  const moves = game.moves || [];

  const handleMoveClick = (index: number) => {
    dispatch(setViewedMoveIndex({ gameId, moveIndex: index }));
  };

  // Track previous move index for directional animations
  // Capture previous value before updating
  const previousIndex = previousMoveIndexRef.current;
  useEffect(() => {
    if (viewedMoveIndex !== null) {
      previousMoveIndexRef.current = viewedMoveIndex;
    } else {
      // Clear the previous index when detail view closes
      // so next opening defaults to sliding from right
      previousMoveIndexRef.current = null;
    }
  }, [viewedMoveIndex]);

  // Determine slide direction for word/definition animation
  // Slide from right when going to later moves (higher index)
  // Slide from left when going to earlier moves (lower index)
  const getSlideDirection = (currentIndex: number | null) => {
    if (previousIndex === null || currentIndex === null) {
      return "right"; // Default to sliding in from right
    }
    // When going forward (to later moves), slide from right
    // When going backward (to earlier moves), slide from left
    return currentIndex > previousIndex ? "right" : "left";
  };

  // Mobile: Bottom sheet - position at bottom, height handled by content
  const windowHeight = use100vh() ?? window.innerHeight;

  // Mobile: List and detail view transitions (switching behavior - detail replaces list)
  const mobileListTransition = useTransition(viewedMoveIndex === null, {
    from: { transform: "translateX(0%)", opacity: 1 },
    enter: { transform: "translateX(0%)", opacity: 1 },
    leave: { transform: "translateX(-100%)", opacity: 0 },
    config: {
      // tension: 200,
      clamp: true,
    },
    immediate: lowPowerMode,
  });

  const mobileDetailTransition = useTransition(
    viewedMoveIndex !== null ? viewedMoveIndex : null,
    {
      key: (item) => item, // Prevent double rendering
      from: () => {
        // Always slide in from right for mobile
        return { transform: "translateX(100%)" };
      },
      enter: { transform: "translateX(0%)" },
      leave: () => {
        // Slide out to right when closing
        return { transform: "translateX(100%)" };
      },
      config: {
        // tension: 200,
        clamp: true,
      },
      immediate: lowPowerMode,
    }
  );

  // Render list view content
  const renderListView = () => (
    <>
      <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-darkbrown">Turn History</h3>
        <button
          onClick={onClose}
          className="lg:hidden p-1 hover:bg-lightbg hover:bg-opacity-50 rounded transition-colors"
          aria-label="Close turn history"
        >
          <FontAwesomeIcon icon={faTimes} className="text-darkbrown" />
        </button>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3"
      >
        {moves.length === 0 ? (
          <div className="text-sm text-textSubtle text-center py-8">
            No moves yet. Make your first move!
          </div>
        ) : (
          moves.map((move, index) => {
            const isPlayer0 = move.player === 0;
            const word = move.letters && move.letters.length > 0
              ? move.letters.join("").toUpperCase()
              : null;
            const isPass = !word || move.pass;
            const moveDate = move.date ? new Date(move.date) : null;

            return (
              <div
                key={index}
                className={classNames(
                  "flex flex-col gap-1",
                  isPlayer0 ? "items-end" : "items-start"
                )}
              >
                <button
                  onClick={() => handleMoveClick(index)}
                  className={classNames(
                    "px-4 py-2 rounded-lg text-sm font-medium max-w-[85%] shadow-md cursor-pointer hover:opacity-80 transition-opacity",
                    isPlayer0 ? "bg-p1" : "bg-p2"
                  )}
                >
                  {isPass ? (
                    <div className="text-xs opacity-70 italic">Pass</div>
                  ) : (
                    <div>{word}</div>
                  )}
                </button>
                {moveDate && (
                  <div
                    className={classNames(
                      "text-[10px] text-textSubtle px-1",
                      isPlayer0 ? "text-right" : "text-left"
                    )}
                  >
                    {relativeDate(moveDate)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );

  if (isDesktop) {
    // Desktop: Side-by-side layout
    // Container width grows naturally as detail panel appears (flexbox handles it)
    // CSS transition makes it smooth for gameboard shrinking
    return (
      <div 
        className={classNames(
          "flex flex-row h-full min-h-0 flex-shrink-0 bg-darkbg overflow-hidden transition-all duration-300 ease-out",
          viewedMoveIndex !== null ? "w-[640px]" : "w-[320px] min-w-[320px]"
        )}
      >
        {/* List View - Always visible */}
        <div className="flex flex-col h-full min-h-0 w-80 flex-shrink-0 bg-darkbg">
          {renderListView()}
        </div>

        {/* Detail View - Static container, internal animations handled by MoveDetailView */}
        {viewedMoveIndex !== null && moves[viewedMoveIndex] ? (
          <div className="flex-shrink-0 w-80 h-full min-h-0">
            <MoveDetailView
              gameId={gameId}
              move={moves[viewedMoveIndex]}
              moveIndex={viewedMoveIndex}
              allMoves={moves}
              previousMoveIndex={previousMoveIndexRef.current}
            />
          </div>
        ) : null}
      </div>
    );
  }

  // Mobile: Bottom sheet overlay
  // Note: Positioning is handled by parent container, this just styles the sheet itself
  return (
    <div
      className="w-full rounded-t-xl bg-darkbg shadow-upward flex flex-col relative"
      style={{
        height: "90vh",
        maxHeight: windowHeight - 50,
      }}
    >
        {/* List View */}
        {mobileListTransition(
          (styles, show) =>
            show && (
              <a.div
                className="absolute inset-0 flex flex-col h-full min-h-0"
                style={styles}
              >
                {renderListView()}
              </a.div>
            )
        )}

        {/* Detail View */}
        {mobileDetailTransition(
          (styles, moveIndex) => {
            const move = moveIndex !== null && moves[moveIndex] ? moves[moveIndex] : null;
            return move && moveIndex !== null ? (
              <a.div
                className="absolute inset-0 flex flex-col h-full min-h-0"
                style={styles}
              >
                <MoveDetailView
                  gameId={gameId}
                  move={move}
                  moveIndex={moveIndex}
                  allMoves={moves}
                  previousMoveIndex={previousMoveIndexRef.current}
                />
              </a.div>
            ) : null;
          }
        )}
    </div>
  );
}


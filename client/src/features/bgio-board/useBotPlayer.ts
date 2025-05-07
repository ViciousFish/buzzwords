import { useEffect, useRef, useCallback } from "react";
import { BoardProps } from "boardgame.io/react";
import { BuzzwordsGameState } from "buzzwords-shared/Buzzwords";
import { TutorialBuzzwords } from "buzzwords-shared/Tutorial";

export function useBotPlayer(props: BoardProps<BuzzwordsGameState>) {
  const isBotMoving = useRef(false);
  const timeoutRefs = useRef<number[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  const handlePass = useCallback(() => {
    props.moves.pass();
    isBotMoving.current = false;
  }, [props.moves]);

  const handleWordMove = useCallback((moveCoords: number[]) => {
    // Queue up all selection updates in advance
    let delay = 0;
    moveCoords.forEach((_, index) => {
      const timeoutId = window.setTimeout(() => {
        props.moves.updateSelection(moveCoords.slice(0, index + 1));
      }, delay);
      timeoutRefs.current.push(timeoutId);
      delay += 500; // Add 500ms for each update
    });

    // After all updates are queued, wait a bit and submit the move
    const finalTimeoutId = window.setTimeout(() => {
      props.moves.playWord(moveCoords);
      isBotMoving.current = false;
    }, delay + 1000);
    timeoutRefs.current.push(finalTimeoutId);
  }, [props.moves]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return clearAllTimeouts;
  }, [clearAllTimeouts]);

  // Bot move logic
  useEffect(() => {
    if (
      props.ctx.currentPlayer !== "1" ||
      props.ctx.gameover ||
      isBotMoving.current
    ) {
      return;
    }

    try {
      const moves = TutorialBuzzwords.ai?.enumerate(props.G, props.ctx, "1");
      
      if (!moves?.length) return;

      const botMove = moves[0];
      if (!botMove || !("move" in botMove)) return;

      isBotMoving.current = true;

      if (botMove.move === "pass") {
        const timeoutId = window.setTimeout(handlePass, 2000);
        timeoutRefs.current.push(timeoutId);
        return;
      }

      if (!botMove.args?.[0]) return;

      const moveCoords = botMove.args[0];
      const thinkingTimeoutId = window.setTimeout(() => {
        handleWordMove(moveCoords);
      }, 2000);
      timeoutRefs.current.push(thinkingTimeoutId);

    } catch (e) {
      console.error("AI failed to make a move:", e);
      isBotMoving.current = true;
      const timeoutId = window.setTimeout(handlePass, 2000);
      timeoutRefs.current.push(timeoutId);
    }
  }, [
    props.ctx.currentPlayer,
    props.ctx.gameover,
    props.G,
    props.ctx,
    handlePass,
    handleWordMove,
  ]);
}

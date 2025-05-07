import { useEffect, useRef } from "react";
import { BoardProps } from "boardgame.io/react";
import { BuzzwordsGameState } from "buzzwords-shared/Buzzwords";
import { TutorialBuzzwords } from "buzzwords-shared/Tutorial";

export function useBotPlayer(props: BoardProps<BuzzwordsGameState>) {
  const isBotMoving = useRef(false);

  useEffect(() => {
    if (
      props.ctx.currentPlayer === "1" &&
      !props.ctx.gameover &&
      !isBotMoving.current
    ) {
      try {
        const moves = TutorialBuzzwords.ai?.enumerate(props.G, props.ctx, "1");
        console.log("🚀 ~ useEffect ~ moves:", moves);
        if (moves && moves.length > 0) {
          const botMove = moves[0];
          if (botMove && "move" in botMove && botMove.args && botMove.args[0]) {
            // Get the bot's move coordinates
            const moveCoords = botMove.args[0];

            // Mark that we're starting the bot's move
            isBotMoving.current = true;

            // Add a 2 second thinking delay before starting the move
            setTimeout(() => {
              // Queue up all selection updates in advance
              let delay = 0;
              moveCoords.forEach((_, index) => {
                setTimeout(() => {
                  props.moves.updateSelection(moveCoords.slice(0, index + 1));
                }, delay);
                delay += 500; // Add 500ms for each update
              });

              // After all updates are queued, wait a bit and submit the move
              setTimeout(() => {
                props.moves.playWord(moveCoords);
                // Reset the flag after the move is complete
                isBotMoving.current = false;
              }, delay + 1000);
            }, 2000);
          } else if (botMove && "move" in botMove && botMove.move === "pass") {
            isBotMoving.current = true;
            setTimeout(() => {
              props.moves.pass();
              isBotMoving.current = false;
            }, 2000);
          }
        }
      } catch (e) {
        console.error("AI failed to make a move:", e);
        isBotMoving.current = true;
        setTimeout(() => {
          props.moves.pass();
          isBotMoving.current = false;
        }, 2000);
      }
    }
  }, [
    props.ctx.currentPlayer,
    props.ctx.gameover,
    props.G,
    props.ctx,
    props.moves,
  ]);
}

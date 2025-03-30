import React, { useState, useMemo, useEffect } from "react";
import {
  Buzzwords,
  BuzzwordsGameState,
  getWordFromMove,
} from "buzzwords-shared/Buzzwords";
import { Button } from "react-aria-components";
import { HexCoord } from "buzzwords-shared/types";
import { BoardProps } from "boardgame.io/dist/types/packages/react";
import { INVALID_MOVE } from "boardgame.io/core";
import { isValidWord } from "buzzwords-shared/alphaHelpers";
import { WordsObject } from "../../../../server/src/words";

export function BGIOStatusArea({
  G,
  ctx,
  moves,
  log,
  selection,
  setSelection,
}: BoardProps<BuzzwordsGameState> & {
  selection: HexCoord[];
  setSelection: (selection: HexCoord[]) => void;
}) {
  console.log("🚀 ~ BGIOStatusArea ~ log:", log);
  const [error, setError] = useState<string | null>(null);
  const yourTurn = ctx.currentPlayer === "0";
  const word = useMemo(
    () => selection.map(({ q, r }) => G.grid[`${q},${r}`].value).join(""),
    [selection, G.grid]
  );
  useEffect(() => {
    if (word.length > 0) {
      setError(null);
    }
  }, [word]);
  return (
    <div className="text-[2vh] mx-auto max-w-[600px] h-[20vh] flex flex-col justify-center items-center p-4 lg:p-8 w-full">
      {word.length > 0 ? (
        <div className="flex gap-2 p-4 justify-center items-center">
          <Button
            className="bg-darkbrown text-lightbg rounded-full px-2 py-1 text-[1vh]"
            onPress={() => {
              setSelection([]);
            }}
          >
            Delete
          </Button>
          <h1 className="text-[4vh] font-fredoka text-darkbrown uppercase">
            {word}
          </h1>
          <Button
            className="bg-darkbrown text-lightbg rounded-full px-2 py-1 text-[1vh]"
            onPress={() => {
              const word = getWordFromMove(G, selection);
              const validWord = isValidWord(word, WordsObject);
              if (word === INVALID_MOVE || !validWord) {
                setSelection([]);
                setError(INVALID_MOVE);
                return;
              }
              moves.playWord(selection);
              setError(null);
              setSelection([]);
            }}
          >
            Submit
          </Button>
        </div>
      ) : (
        <div className="">
          {error ? (
            <>
              <p className="font-bold">That wasn&apos;t a valid word</p>
              <p className="text-[1.5vh]">Select a word</p>
            </>
          ) : (
            <>
              <h1 className="font-bold">
                Welcome to{" "}
                <img
                  className="inline drop-shadow mb-1 ml-1 relative bottom-1"
                  style={{ width: 30, height: 30 }}
                  src="/bee.png"
                />{" "}
                <span className="text-darkbrown font-fredoka uppercase">
                  Buzzwords
                </span>
              </h1>
              <p className="text-[1.5vh]">
                {yourTurn
                  ? "It's your turn. Select a word"
                  : "Waiting for your opponent"}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

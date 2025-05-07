import React, { useState, useMemo, useEffect } from "react";
import {
  BuzzwordsGameState,
  getWordFromMove,
} from "buzzwords-shared/Buzzwords";
import { Button } from "react-aria-components";
import { HexCoord } from "buzzwords-shared/types";
import { BoardProps } from "boardgame.io/dist/types/packages/react";
import { INVALID_MOVE } from "boardgame.io/core";
import { isValidWord } from "buzzwords-shared/alphaHelpers";
import { WordsObject } from "../../../../server/src/words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronCircleLeft,
  faChevronCircleRight,
  faChevronLeft,
  faChevronRight,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";

const HINT_MESSAGES = [
  "You can use any letter on the board",
  "You'll only capture tiles that connect to your territory",
  <>
    Try to protect your flower tile. Your opponent gets an extra turn if they
    capture it
  </>,
  "Try to capture your opponent's flower tile",
  "There is no penalty for trying a word that doesn't exist",
];

const STATUS_AREA_STATES = [
  "INVALID_WORD",
  "INITIAL_TURN",
  "OPPONENT_FIRST_TURN",
  "YOUR_TURN",
  "OPPONENT_TURN",
  "YOUR_BONUS_TURN",
  "OPPONENT_BONUS_TURN",
] as const;

function InvalidWordStatus() {
  return (
    <>
      <p className="text-4xl font-bold">That wasn&apos;t a valid word</p>
      <p className="text-xl">Select a word</p>
    </>
  );
}

function InitialTurnStatus() {
  return (
    <>
      <h1 className="text-4xl font-bold">
        Welcome to{" "}
        <span className="font-fredoka uppercase text-nowrap">
          <img
            className="inline drop-shadow mb-1 ml-1 relative bottom-1"
            style={{ width: 30, height: 30 }}
            src="/bee.png"
          />{" "}
          Buzzwords
        </span>
      </h1>
      <p className="text-xl">
        {"It's your turn. Press letters to spell a word"}
      </p>
    </>
  );
}

function OpponentFirstTurnStatus() {
  return (
    <>
      <h1 className="text-4xl font-bold">Hello to you too</h1>
      <p className="text-xl">Now it&apos;s your opponent&apos;s turn</p>
    </>
  );
}

function OpponentTurnStatus() {
  return (
    <>
      <h1 className="text-4xl font-bold">Nice one</h1>
      <p className="text-xl">Now it&apos;s your opponent&apos;s turn</p>
    </>
  );
}

function YourTurnStatus({ turn }: { turn: number }) {
  const initialHintIndex = useMemo(() => {
    if (turn <= HINT_MESSAGES.length * 2) {
      return Math.floor(turn / 2) - 1;
    }
    return Math.floor(Math.random() * HINT_MESSAGES.length);
  }, [turn]);
  const [hintIndex, setHintIndex] = useState(initialHintIndex);

  return (
    <div className="px-4 py-2 flex-auto flex flex-col">
      <span className="text-md">It&apos;s your turn</span>
      <p className="text-2xl font-bold w-full flex-auto">{HINT_MESSAGES[hintIndex]}</p>
      <span className="flex relative top-[-2px] self-end items-center text-xs font-normal text-lightbg bg-darkbrown rounded-full">
        <Button
          onPress={() => {
            setHintIndex((index) =>
              index === 0 ? HINT_MESSAGES.length - 1 : index - 1
            );
          }}
          type="button"
          className="self-end text-sm px-2"
          aria-label="Press to show next hint"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </Button>
        <span className="">
          {hintIndex + 1} / {HINT_MESSAGES.length}
        </span>
        <Button
          onPress={() => {
            setHintIndex((index) =>
              index === HINT_MESSAGES.length - 1 ? 0 : index + 1
            );
          }}
          type="button"
          className="self-end text-sm px-2"
          aria-label="Press to show next hint"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </Button>
      </span>
    </div>
  );
}

function YourBonusTurnStatus() {
  return (
    <>
      <h1 className="font-bold">You get a bonus turn</h1>
      <p className="text-xl">
        Now&apos; your chance to win. Try to eliminate all of your
        opponent&apos;s territory.
      </p>
    </>
  );
}

function renderStatus(
  turn: number,
  yourTurn: boolean,
  error: string | null,
  isBonusTurn: boolean,
  winner?: string
) {
  if (error) {
    return <InvalidWordStatus />;
  }
  if (yourTurn && isBonusTurn) {
    return <YourBonusTurnStatus />;
  }
  if (turn === 1) {
    return <InitialTurnStatus />;
  }
  // if (turn === 2) {
  //   return <OpponentFirstTurnStatus />
  // }
  if (yourTurn) {
    return <YourTurnStatus turn={turn} />;
  }
  return <OpponentTurnStatus />;
}

export function BGIOStatusArea({
  G,
  ctx,
  moves,
  selection,
  setSelection,
  playerID,
  log,
}: BoardProps<BuzzwordsGameState> & {
  selection: HexCoord[];
  setSelection: (selection: HexCoord[]) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const yourTurn = ctx.currentPlayer === "0";
  const bonusTurn = log[log.length - 1]; // TODO figure out how to tell
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
    <div className="mx-auto max-w-[600px] h-[20vh] flex flex-col justify-center items-center p-4 lg:p-8 w-full">
      {word.length > 0 ? (
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-fredoka text-darkbrown uppercase">
            {word}
          </h1>
          <div className="flex gap-2 justify-center items-center">
            <Button
              className="bg-darkbrown opacity-80 text-lightbg rounded-full px-3 py-1 text-sm"
              onPress={() => {
                setSelection([]);
              }}
            >
              Clear
            </Button>
            <Button
              className="bg-darkbrown text-lightbg rounded-full px-3 py-1 text-sm"
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
        </div>
      ) : (
        <div className="w-full text-darkbrown flex-auto flex flex-col justify-center">
          {renderStatus(ctx.turn, yourTurn, error, false, ctx.gameover)}
        </div>
      )}
    </div>
  );
}

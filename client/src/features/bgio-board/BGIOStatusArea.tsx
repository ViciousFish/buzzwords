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
  faBackspace,
  faChevronLeft,
  faChevronRight,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import Canvas from "../canvas/Canvas";
import Bee from "../../assets/Bee";

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
      <p className="text-[5vh] font-bold">That wasn&apos;t a valid word</p>
      <p className="text-[3vh]">Select a word</p>
    </>
  );
}

function InitialTurnStatus() {
  return (
    <>
      <h1 className="text-[4vh] font-bold">
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
      <p className="text-[3vh]">
        {"It's your turn. Press letters to spell a word"}
      </p>
    </>
  );
}

function OpponentFirstTurnStatus() {
  return (
    <>
      <h1 className="text-[5vh] font-bold">Hello to you too</h1>
      <p className="text-[3vh]">Now it&apos;s your opponent&apos;s turn</p>
    </>
  );
}

function OpponentTurnStatus() {
  return (
    <div className="grid grid-cols-[1fr,128px]">
      <div className="flex flex-col justify-center">
        <h1 className="text-[5vh] font-bold">Nice one</h1>
        <p className="text-[3vh]">Now it&apos;s The Bee&apos;s turn</p>
      </div>
      <div className="p-2">
        <Canvas>
          <Bee />
        </Canvas>
      </div>
    </div>
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

  const preferred_alignment = "justify-center";

  return (
    <>
      <div className="flex-auto flex flex-col justify-center">
        <span className="">It&apos;s your turn</span>
        <p className="text-[3vh] font-bold">{HINT_MESSAGES[hintIndex]}</p>
      </div>
      <div className={`flex ${preferred_alignment}`}>
        <div className="flex relative top-[-2px] self-end items-center text-xs font-normal text-lightbg bg-darkbrown rounded-full">
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
        </div>
      </div>
    </>
  );
}

function YourBonusTurnStatus() {
  return (
    <>
      <h1 className="font-bold text-[5vh]">You get a bonus turn</h1>
      <p className="text-[3vh]">
        Now&apos;s your chance to win. Try to eliminate all of your
        opponent&apos;s territory.
      </p>
    </>
  );
}

function OpponentBonusTurnStatus() {
  return (
    <>
      <h1 className="font-bold text-[5vh]">The Bee gets a bonus turn</h1>
      <p className="text-[3vh]">
        The Bee is trying to eliminate all of your territory.
      </p>
    </>
  );
}

function GameOverStatus({ winner }: { winner: string }) {
  return (
    <>
      <h1 className="text-[5vh] font-bold">
        {winner === "0" ? "You won" : "The Bee won!"}
      </h1>
      <p className="text-[3vh]">
        {winner === "0"
          ? "Welcome to Buzzwords! Play again against The Bee or invite a friend."
          : "Better luck next time!"}
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
  if (winner) {
    return <GameOverStatus winner={winner} />;
  }
  if (error) {
    return <InvalidWordStatus />;
  }
  if (yourTurn && isBonusTurn) {
    return <YourBonusTurnStatus />;
  }
  if (!yourTurn && isBonusTurn) {
    return <OpponentBonusTurnStatus />;
  }
  if (turn === 1) {
    return <InitialTurnStatus />;
  }
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
  const bonusTurn = useMemo(() => {
    console.log(log.length);
    if (
      !log ||
      log.filter((entry) => entry.action.payload.type === "playWord").length ===
        0
    )
      return false;
    const lastMove = log[log.length - 1];
    // If the last move was by the current player, it means they captured a capital
    // and got a bonus turn
    return yourTurn
      ? lastMove.action.payload.playerID === ctx.currentPlayer
      : lastMove.action.payload.playerID !== ctx.currentPlayer;
  }, [log, ctx.currentPlayer, yourTurn]);
  const word = useMemo(
    () => selection.map(({ q, r }) => G.grid[`${q},${r}`].value).join(""),
    [selection, G.grid]
  );
  useEffect(() => {
    if (word.length > 0) {
      setError(null);
    }
  }, [word]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!yourTurn || ctx.gameover) return;

      if (e.key === "Enter" && word.length > 0) {
        const validWord = isValidWord(word, WordsObject);
        if (word === INVALID_MOVE || !validWord) {
          setSelection([]);
          setError(INVALID_MOVE);
          return;
        }
        moves.playWord(selection);
        setError(null);
        setSelection([]);
      } else if (e.key === "Backspace" && selection.length > 0) {
        setSelection(selection.slice(0, selection.length - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [word, selection, yourTurn, ctx.gameover, moves, setSelection]);

  const preferred_alignment = "justify-center";

  return (
    <div className="mx-auto aspect-[3.7] h-[25vh] text-[2vh] grid items-stretch py-2 px-6 lg:px-8 max-w-full">
      {word.length > 0 ? (
        <div className="flex-auto flex flex-col justify-center gap-2 items-center">
          <h1 className="text-[5vh] font-fredoka text-darkbrown uppercase text-center">
            {word}
          </h1>
          {ctx.currentPlayer === "0" && !ctx.gameover && (
            <div className={`flex gap-1 ${preferred_alignment}`}>
              <Button
                className="bg-darkbrown text-lightbg rounded-full px-3 py-1 text-sm"
                onPress={() => {
                  setSelection(selection.slice(0, selection.length - 1));
                }}
              >
                <FontAwesomeIcon icon={faBackspace} /> Backspace
              </Button>{" "}
              <Button
                className="bg-darkbrown text-lightbg rounded-full px-3 py-1 text-sm"
                onPress={() => {
                  setSelection([]);
                }}
              >
                Clear
              </Button>
              <Button
                className="bg-green-600 text-lightbg rounded-full px-3 py-1 text-sm"
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
                <FontAwesomeIcon icon={faPlay} /> Submit
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full text-darkbrown flex-auto flex flex-col justify-center items-stretch">
          {renderStatus(ctx.turn, yourTurn, error, bonusTurn, ctx.gameover)}
        </div>
      )}
    </div>
  );
}

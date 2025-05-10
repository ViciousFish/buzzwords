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
import HexGrid from "buzzwords-shared/hexgrid";
import { getCellNeighbors } from "buzzwords-shared/hexgrid";
import { willConnectToTerritory } from "buzzwords-shared/gridHelpers";
import Cell from "buzzwords-shared/cell";

const HINT_MESSAGES = [
  "You can use any letter on the board",
  "You'll capture tiles that you use that connect to your territory",
  "The objective is to capture all of your opponent's territory",
  "Try to capture your opponent's flower tile. You'll get an extra turn when you do",
  "Try to protect your flower tile",
  "There is no penalty for trying a word that doesn't exist",
];

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
            style={{ width: "4vh", aspectRatio: "1" }}
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
        <p className="text-[3vh]">Now it&apos;s your opponent&apos;s turn</p>
      </div>
      <div className="p-2">
        <Canvas>
          <Bee />
        </Canvas>
      </div>
    </div>
  );
}

function YourBonusTurnStatus() {
  return (
    <>
      <h1 className="font-bold text-[3vh]">You get a bonus turn</h1>
      <p className="">
        Now&apos;s your chance to win. Try to eliminate all of your
        opponent&apos;s territory.
      </p>
    </>
  );
}

function OpponentBonusTurnStatus() {
  return (
    <>
      <h1 className="font-bold text-[3vh]">Your opponent gets a bonus turn</h1>
      <p className="">
        They are trying to eliminate all of your territory.
      </p>
    </>
  );
}

function FlowerCapturableStatus() {
  return (
    <>
      <h1 className="font-bold text-[3vh]">Try to capture the green flower</h1>
      <p className="">
        Your opponent&apos;s flower tile is now reachable from your territory.
        If you can use an unbroken chain of letters to connect to it, you&apos;ll
        capture it and get a bonus turn!
      </p>
    </>
  );
}

function GameOverStatus({ winner }: { winner: string }) {
  return (
    <>
      <h1 className="text-[5vh] font-bold">
        {winner === "0" ? "You won!" : "The Bee won!"}
      </h1>
      <p className="text-[3vh]">
        {winner === "0"
          ? "Play again against the bot or invite a friend."
          : "Better luck next time."}
      </p>
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

function isFlowerCapturable(grid: HexGrid, player: 0 | 1): boolean {
  // Find opponent's flower tile
  const opponentFlower = Object.entries(grid).find(
    ([_, cell]) => cell.capital && cell.owner === Number(!player)
  );
  if (!opponentFlower) return false;

  // Check if any neutral tile adjacent to the flower connects to player's territory
  const [_, flowerCell] = opponentFlower;
  const neighbors = getCellNeighbors(grid, flowerCell.q, flowerCell.r);
  
  // For each neutral neighbor, check if there's a path to player territory
  return neighbors.some(neighbor => {
    // Skip non-neutral tiles or neutral tiles without letters
    if (neighbor.owner !== 2 || neighbor.value === "") return false;
    
    // Use a flood fill to find if there's a path to player territory
    const visited = new Set<string>();
    const stack: Cell[] = [neighbor];
    
    while (stack.length > 0) {
      const current = stack.pop()!;
      const key = `${current.q},${current.r}`;
      if (visited.has(key)) continue;
      visited.add(key);
      
      // If we found player territory, we have a path!
      if (current.owner === player) return true;
      
      // Only continue through neutral tiles that have letters
      if (current.owner === 2 && current.value !== "") {
        stack.push(...getCellNeighbors(grid, current.q, current.r));
      }
    }
    
    return false;
  });
}

interface StatusSwitchProps {
  turn: number;
  yourTurn: boolean;
  error: string | null;
  isBonusTurn: boolean;
  winner?: string;
  flowerCapturable?: boolean;
}

function StatusSwitch({
  turn,
  yourTurn,
  error,
  isBonusTurn,
  winner,
  flowerCapturable,
}: StatusSwitchProps) {
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
  if (yourTurn && flowerCapturable) {
    return <FlowerCapturableStatus />;
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

  const flowerCapturable = useMemo(() => {
    if (!yourTurn) return false;
    return isFlowerCapturable(G.grid, 0);
  }, [G.grid, yourTurn]);

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
          <StatusSwitch
            turn={ctx.turn}
            yourTurn={yourTurn}
            error={error}
            isBonusTurn={bonusTurn}
            winner={ctx.gameover}
            flowerCapturable={flowerCapturable}
          />
        </div>
      )}
    </div>
  );
}

import * as R from "ramda";

import HexGrid, { getCellNeighbors } from "./hexgrid";

import { getRandomInt, shuffle } from "./utils";
import { normalize } from "./alphaHelpers";
import { HexCoord } from "./types";

// OpenTelemetry import - only available in server environment
let opentelemetry: any = null;
let tracer: any = null;

try {
  // Only import OpenTelemetry if we're in a Node.js environment (server-side)
  if (typeof globalThis !== 'undefined' && !(globalThis as any).window && typeof process !== 'undefined') {
    opentelemetry = require("@opentelemetry/api");
    tracer = opentelemetry.trace.getTracer("buzzwords-bot");
  }
} catch (e) {
  // OpenTelemetry not available, continue without tracing
}

export const getBotMove = (
  grid: HexGrid,
  options: {
    difficulty: number;
    words: {
      [key: string]: number;
    };
    bannedWords: {
      [key: string]: number;
    };
  }
): HexCoord[] => {
  // Helper function to run with or without tracing
  const runWithTracing = (fn: () => HexCoord[]) => {
    if (tracer && opentelemetry) {
      return tracer.startActiveSpan("getBotMove.analyze", (span: any) => {
        try {
          const openTiles = Object.values(grid).filter((cell) => {
            return !cell.capital && cell.owner == 2 && cell.value != "";
          });

          span.setAttributes({
            "bot.difficulty": options.difficulty,
            "bot.openTilesCount": openTiles.length,
            "bot.totalWordsAvailable": Object.keys(options.words).length
          });

          const result = fn();
          
          span.setAttributes({
            "bot.selectedMoveLength": result.length,
            "bot.selectedWord": result.map(coord => {
              const cell = grid[`${coord.q},${coord.r}`];
              return cell?.value || '';
            }).join('')
          });
          
          span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({ 
            code: opentelemetry.SpanStatusCode.ERROR, 
            message: (error as Error).message 
          });
          throw error;
        } finally {
          span.end();
        }
      });
    } else {
      return fn();
    }
  };

  return runWithTracing(() => {
    const openTiles = Object.values(grid).filter((cell) => {
      return !cell.capital && cell.owner == 2 && cell.value != "";
    });

    const botCapital = Object.values(grid).find((c) => c.owner == 1 && c.capital);
    if (!botCapital) {
      throw "Bot doesn't have capital on its own turn. Shouldn't be possible!";
    }

    const capitalNeighbors = shuffle(
      getCellNeighbors(grid, botCapital.q, botCapital.r).filter(
        (c) => c.owner == 2
      )
    );

    const nonCapitalNeighbors = shuffle(
      Object.values(grid)
        .filter(
          (cell) =>
            getCellNeighbors(grid, cell.q, cell.r)
              .map((c) => c.owner)
              .includes(1) &&
            cell.owner == 2 &&
            !cell.capital &&
            cell.value != ""
        )
        .filter(
          (cell) =>
            !getCellNeighbors(grid, cell.q, cell.r)
              .map((c) => c.capital && Boolean(c.owner))
              .includes(true)
        )
    );

    const capitalNeighborCoords = capitalNeighbors.map((c) => `${c.q},${c.r}`);
    const nonCapitalNeighborCoords = nonCapitalNeighbors.map(
      (c) => `${c.q},${c.r}`
    );

    const nonNeighborTiles = shuffle(
      openTiles.filter(
        (c) =>
          !capitalNeighborCoords.includes(`${c.q},${c.r}`) &&
          !nonCapitalNeighborCoords.includes(`${c.q},${c.r}`)
      )
    );
    const nonNeighborCoords = nonNeighborTiles.map((c) => `${c.q},${c.r}`);

    const possibleWordsToScore: {
      [key: string]: { score: number; move: HexCoord[]; word: string };
    } = {};

    const coordTypes = [
      nonNeighborCoords,
      nonCapitalNeighborCoords,
      capitalNeighborCoords,
    ];

    // Add tracing for word analysis if available
    const analyzeWords = () => {
      let wordsAnalyzed = 0;
      let validWords = 0;

      for (const word of Object.keys(options.words)) {
        if (word.length < 3) {
          continue;
        }
        wordsAnalyzed++;
        
        const tiles = [
          ...capitalNeighbors,
          ...nonCapitalNeighbors,
          ...nonNeighborTiles,
        ];
        let valid = true;
        let score = 1;
        let move: HexCoord[] = [];
        for (let letter of word.split("")) {
          const idx = tiles.findIndex((cell) => cell.value === letter);
          if (idx === -1) {
            valid = false;
            break;
          }
          score++;
          const coord = `${tiles[idx].q},${tiles[idx].r}`;
          for (let i = 0; i < coordTypes.length; i++) {
            if (coordTypes[i].includes(coord)) {
              score *= Math.pow(10, i);
              break;
            }
          }

          move.push({ q: tiles[idx].q, r: tiles[idx].r });
          tiles.splice(idx, 1);
        }
        if (valid) {
          validWords++;
          possibleWordsToScore[word] = { score, move, word };
        }
      }

      // Add attributes if tracing is available
      if (tracer && opentelemetry) {
        const currentSpan = opentelemetry.trace.getActiveSpan();
        if (currentSpan) {
          currentSpan.setAttributes({
            "bot.wordsAnalyzed": wordsAnalyzed,
            "bot.validWordsFound": validWords,
            "bot.capitalNeighborsCount": capitalNeighbors.length,
            "bot.nonCapitalNeighborsCount": nonCapitalNeighbors.length,
            "bot.nonNeighborTilesCount": nonNeighborTiles.length
          });
        }
      }
    };

    analyzeWords();

    const wordScoresByWordLength: {
      score: number;
      move: HexCoord[];
      word: string;
    }[][] = [];
    for (let i = 3; i <= openTiles.length; i++) {
      wordScoresByWordLength[i - 3] = [];
    }
    for (let wordInfo of Object.values(possibleWordsToScore)) {
      wordScoresByWordLength[wordInfo.word.length - 3].push(wordInfo);
    }

    const jitter = getRandomInt(-1, 2);

    const maxWordLength = R.clamp(
      3,
      openTiles.length,
      Math.floor(
        normalize(
          options.difficulty + jitter,
          1,
          10,
          3,
          Math.min(openTiles.length, 12)
        )
      ) - 2
    );

    // Add tracing for word selection if available
    if (tracer && opentelemetry) {
      const currentSpan = opentelemetry.trace.getActiveSpan();
      if (currentSpan) {
        currentSpan.setAttributes({
          "bot.maxWordLength": maxWordLength,
          "bot.jitter": jitter,
          "bot.wordLengthOptions": wordScoresByWordLength.map((words, idx) => words.length).join(',')
        });
      }
    }

    for (let i = maxWordLength; i >= 3; i--) {
      let words = wordScoresByWordLength[i - 3];
      if (!words.length) {
        continue;
      }
      const sortedWordScores = wordScoresByWordLength[i - 3].sort(
        (a, b) => a.score - b.score
      );
      const selectedWord =
        sortedWordScores[
          sortedWordScores.length -
            getRandomInt(1, Math.min(sortedWordScores.length, 5))
        ];

      // Add final tracing attributes if available
      if (tracer && opentelemetry) {
        const currentSpan = opentelemetry.trace.getActiveSpan();
        if (currentSpan) {
          currentSpan.setAttributes({
            "bot.selectedWordLength": i,
            "bot.selectedWordScore": selectedWord.score,
            "bot.availableWordsAtLength": sortedWordScores.length,
            "bot.topScoreAtLength": sortedWordScores[sortedWordScores.length - 1]?.score || 0,
            "bot.bottomScoreAtLength": sortedWordScores[0]?.score || 0
          });
        }
      }

      return selectedWord.move;
    }

    throw "Shouldn't get here ever";
  });
};

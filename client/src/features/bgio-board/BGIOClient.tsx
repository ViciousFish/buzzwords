import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { BGIOGameBoard } from "./BGIOGameBoard";
import {
  initializeLocalBotGame,
  loadLocalBotGame,
} from "./localBotSlice";
import { initializeFirstTutorialIfNeeded } from "./localBotThunks";
import { tutorialInitialBoard } from "buzzwords-shared/Tutorial";
import "./BGIOClient.css";

interface BGIOClientProps {
  gameId?: string;
}

const BGIOClient: React.FC<BGIOClientProps> = ({ gameId }) => {
  const dispatch = useAppDispatch();
  const localBotState = useAppSelector((state) => state.localBot);
  
  const activeGameId = gameId || localBotState.mostRecentGameId;
  const currentGame = activeGameId ? localBotState.games[activeGameId] : null;

  useEffect(() => {
    if (gameId) {
      // Try to load existing game
      if (localBotState.games[gameId]) {
        dispatch(loadLocalBotGame(gameId));
      } else {
        // Game doesn't exist, create new tutorial game with this ID
        dispatch(
          initializeLocalBotGame({
            gameId,
            grid: tutorialInitialBoard,
            difficulty: 3,
            isTutorial: true,
          })
        );
      }
    }
    // Note: First tutorial initialization is handled in appActions.initAction()
  }, [gameId, dispatch, localBotState.games]);

  if (!activeGameId || !currentGame) {
    return <div>Loading local bot game...</div>;
  }

  return <BGIOGameBoard gameId={activeGameId} />;
};

export default BGIOClient;

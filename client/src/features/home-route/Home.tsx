import React from "react";
import { useAppSelector } from "../../app/hooks";
import BGIOClient from "../bgio-board/BGIOClient";
import HomeDashboard from "./HomeDashboard";

const Home: React.FC = () => {
  const localBotState = useAppSelector((state) => state.localBot);
  const onlineGames = useAppSelector((state) => state.gamelist.games);
  const gamesLoaded = useAppSelector((state) => state.gamelist.gamesLoaded);

  // Check if there's a current game that is a tutorial and not finished
  const currentGame = localBotState.mostRecentGameId
    ? localBotState.games[localBotState.mostRecentGameId]
    : null;

  const localGameCount = Object.keys(localBotState.games).length;
  const onlineGameCount = Object.keys(onlineGames).length;

  const shouldShowTutorial =
    (currentGame &&
      currentGame.isTutorial &&
      !currentGame.gameover &&
      localGameCount === 1 &&
      onlineGameCount === 0) ||
    (localGameCount === 0 && onlineGameCount === 0 && gamesLoaded);

  if (shouldShowTutorial) {
    return <BGIOClient gameId={currentGame?.id} />;
  }

  return <HomeDashboard />;
};

export default Home;

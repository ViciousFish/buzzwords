import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import BGIOClient from "../bgio-board/BGIOClient";
import { loadLocalBotGame } from "../bgio-board/localBotSlice";

const LocalGameContainer: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const dispatch = useAppDispatch();
  const localBotState = useAppSelector((state) => state.localBot);

  useEffect(() => {
    if (gameId && localBotState.games[gameId]) {
      dispatch(loadLocalBotGame(gameId));
    }
  }, [gameId, dispatch, localBotState.games]);

  if (!gameId) {
    return <div>Invalid game ID</div>;
  }

  return <BGIOClient gameId={gameId} />;
};

export default LocalGameContainer;


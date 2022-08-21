import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import urljoin from "url-join";
import * as R from "ramda";

import { setCurrentGame, toggleNudgeButton } from "../game/gameSlice";
import {
  dequeueOrDismissGameStateModalForGame,
  fetchGameById,
  markGameAsSeen,
} from "../gamelist/gamelistActions";
import GameBoard from "../game/GameBoard";
import NicknameModal from "../user/NicknameModal";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import GameStateModal from "../game/GameStateModal";
import { getOpponent } from "../user/userSelectors";
import { fetchOpponent } from "../user/userActions";
import { isFullGame } from "../gamelist/gamelistSlice";
import GameHeader from "./GameHeader";
import { MoveList } from "../game/MoveList";
import GameInvitation from "./GameInvitation";
import GameInviteOpponentPrompt from "./GameInviteOpponentPrompt";
import useDimensions from "react-cool-dimensions";
import { BREAKPOINTS } from "../../app/MainGameStructure";
import classNames from "classnames";

export const getGameUrl = (id: string) => {
  if (import.meta.env.VITE_SHARE_BASEURL) {
    return urljoin(String(import.meta.env.VITE_SHARE_BASEURL), "play", id);
  }
  console.warn("warning: VITE_SHARE_BASEURL is not defined");
  return window.location.toString();
};

const Play: React.FC = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams();

  const game = useAppSelector((state) =>
    id ? state.gamelist.games[id] : null
  );
  const currentUser = useAppSelector((state) => state.user.user);

  const gameStateModal = useAppSelector((state) => state.game.gameStateModal);

  const gameLoadingState = useAppSelector(
    (state) => id && state.gamelist.gamesLoading[id]
  );

  const [fourohfour, setFourohfour] = useState(false);
  const [fetchedOpponentName, setFetchedOpponentName] = useState(false);

  const userIndex =
    game && currentUser
      ? game.users.findIndex((val) => val === currentUser.id)
      : null;

  const isSpectating = userIndex === -1;

  const opponent = useAppSelector((state) =>
    id ? getOpponent(state, id) : null
  );

  useEffect(() => {
    if (id) {
      console.log("set current game", id);
      dispatch(setCurrentGame(id));
      dispatch(markGameAsSeen(id));
    }
    return () => {
      dispatch(setCurrentGame(null));
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!gameLoadingState && id) {
      dispatch(fetchGameById(id)).then((joinedGame) => {
        if (!joinedGame) {
          setFourohfour(true);
        }
      });
    }
  }, [id, dispatch, game, gameLoadingState]);

  useEffect(() => {
    if (
      game &&
      game.vsAI &&
      game.turn === 1 &&
      isFullGame(game) &&
      game.moves.length > 1 &&
      !game.gameOver
    ) {
      const move = game.moves[game.moves.length - 1];
      if (
        move.date &&
        new Date().getTime() - new Date(move.date).getTime() > 20000
      ) {
        dispatch(toggleNudgeButton(true));
      }
    }
  }, [game, dispatch]);

  useEffect(() => {
    if (game && isSpectating && !fetchedOpponentName) {
      setFetchedOpponentName(true);
      game.users.forEach((user) => dispatch(fetchOpponent(user)));
    } else if (game && opponent && !opponent.nickname && !fetchedOpponentName) {
      setFetchedOpponentName(true);
      dispatch(fetchOpponent(opponent.id));
    }
  }, [game, opponent, fetchedOpponentName, dispatch, isSpectating]);

  const nickModal =
    game && currentUser && !isSpectating && !currentUser.nickname ? (
      <NicknameModal />
    ) : null;

  const { observe, currentBreakpoint } = useDimensions({
    breakpoints: R.pick(["xs", "md"], BREAKPOINTS),
    updateOnBreakpointChange: true,
  });

  if (!game || !id || !isFullGame(game)) {
    return null;
  }

  if (fourohfour) {
    return (
      <div className="flex flex-auto flex-col h-screen justify-center items-center">
        <h1>404</h1>
        <Link className="underline text-blue-700" to="/">
          home
        </Link>
      </div>
    );
  }

  if (game.users.length === 1 && userIndex !== null && userIndex === -1) {
    return (
      <GameInvitation
        id={id}
        setFourohfour={setFourohfour}
        opponent={opponent}
      />
    );
  }

  if (game.users.length === 1 && userIndex !== null && userIndex > -1) {
    return (
      <>
        <GameInviteOpponentPrompt id={id} gameUrl={getGameUrl(id)} />
        {nickModal}
      </>
    );
  }

  return (
    <div
      ref={observe}
      className="flex flex-auto h-full flex-col overflow-hidden"
    >
      <GameHeader game={game} />
      {/* CQ: TODO: switch to cool-dimension to set flex direction based on measured available space instead of viewport size */}
      <div
        className={classNames(
          "flex flex-auto  overflow-hidden",
          currentBreakpoint === "md" ? "flex-row" : "flex-col"
        )}
      >
        {userIndex !== null && (
          <GameBoard id={id} game={game} userIndex={userIndex} />
        )}
        <MoveList mobileLayout={currentBreakpoint === "xs"} id={id} />
        {nickModal}
        {gameStateModal && (
          <GameStateModal
            {...gameStateModal}
            onDismiss={() =>
              dispatch(dequeueOrDismissGameStateModalForGame(id))
            }
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(Play);

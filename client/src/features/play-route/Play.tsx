import React, { useCallback, useEffect, useState } from "react";
import * as R from "ramda";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faPlayCircle,
  faShare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import urljoin from "url-join";

import { RootState } from "../../app/store";
import {
  clearReplay,
  setCurrentGame,
  toggleNudgeButton,
} from "../game/gameSlice";
import {
  deleteGameById,
  dequeueOrDismissGameStateModalForGame,
  fetchGameById,
  joinGameById,
  markGameAsSeen,
} from "../gamelist/gamelistActions";
import GameBoard from "../game/GameBoard";
import CopyToClipboard from "../../presentational/CopyToClipboard";
import NicknameModal from "../user/NicknameModal";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { nudgeGameById } from "../game/gameActions";
import classNames from "classnames";
import Button from "../../presentational/Button";
import GameStateModal from "../game/GameStateModal";
import MoveListItem from "./MoveListItem";
import { getOpponent } from "../user/userSelectors";
import { fetchOpponent } from "../user/userActions";
import { isFullGame } from "../gamelist/gamelistSlice";

const getGameUrl = (id: string) => {
  if (import.meta.env.VITE_SHARE_BASEURL) {
    return urljoin(String(import.meta.env.VITE_SHARE_BASEURL), "play", id);
  }
  console.warn("warning: VITE_SHARE_BASEURL is not defined");
  return window.location.toString();
};

const Play: React.FC = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams();
  const navigate = useNavigate();

  const game = useSelector((state: RootState) =>
    id ? state.gamelist.games[id] : null
  );
  const currentUser = useSelector((state: RootState) => state.user.user);
  const replayState = useAppSelector((state) =>
    Boolean(state.game.replay.move)
  );
  const gameStateModal = useAppSelector((state) => state.game.gameStateModal);
  const showingNudgeButton = useAppSelector(
    (state) => state.game.showingNudgeButton
  );
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

  const joinGame = useCallback(() => {
    if (id) {
      dispatch(joinGameById(id)).then((joinedGame) => {
        if (!joinedGame) {
          setFourohfour(true);
        }
      });
    }
  }, [id, dispatch]);

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

  const onNudgeClick = useCallback(() => {
    if (!id) {
      return;
    }
    try {
      dispatch(nudgeGameById(id));
      dispatch(toggleNudgeButton(false));
    } catch (e) {
      toast(e, {
        type: "error",
      });
    }
  }, [dispatch, id]);

  const nickModal =
    game && currentUser && !isSpectating && !currentUser.nickname ? (
      <NicknameModal />
    ) : null;

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
      <div className="flex flex-auto flex-col overflow-auto lg:h-[calc(100vh-50px)] justify-center items-center py-12 px-4">
        <div className="max-w-full flex-shrink-0 bg-darkbg flex flex-col justify-center items-center text-center p-8 rounded-xl mb-5">
          <h2 className="text-2xl flex-wrap">
            <span className="font-bold italic">
              {opponent?.nickname || "???"}
            </span>{" "}
            has invited you to play Buzzwords
          </h2>
        </div>
        <Button onClick={joinGame}>Join game</Button>
      </div>
    );
  }

  if (game.users.length === 1 && userIndex !== null && userIndex > -1) {
    return (
      <div className="flex flex-auto flex-col overflow-auto lg:h-[calc(100vh-50px)] justify-center items-center py-12 px-4">
        <div className="max-w-full flex-shrink-0 bg-darkbg flex flex-col justify-center items-center text-center p-8 rounded-xl mb-5">
          <h2 className="text-2xl flex-wrap">
            Invite an opponent to start the game
          </h2>
          <span>they can use this link to join you</span>
          <a
            className="underline text-blue-700 text-sm break-words"
            href={getGameUrl(id)}
          >
            {getGameUrl(id)}
          </a>
          <div>
            <CopyToClipboard label="Copy link" text={getGameUrl(id)} />
            {navigator.share && (
              <Button
                onClick={() => {
                  navigator.share?.({
                    url: getGameUrl(id),
                  });
                }}
              >
                Share <FontAwesomeIcon icon={faShare} />{" "}
              </Button>
            )}
            {id && (
              <Button
                className="bg-red-600 text-white"
                onClick={() => {
                  dispatch(deleteGameById(id));
                  navigate("/");
                }}
              >
                <FontAwesomeIcon className="mr-2" icon={faTrash} />
                Delete
              </Button>
            )}
          </div>
        </div>
        <div className=" bg-darkbg rounded-xl text-center">
          <h2 className="text-2xl">Watch the tutorial</h2>
          <span>in the mean time</span>
          <iframe
            style={{
              maxWidth: "100%",
              width: "560px",
            }}
            height="315"
            src="https://www.youtube.com/embed/MwULUSGQ9oo"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="border-darkbrown border-2 rounded-lg"
          ></iframe>
        </div>
        {nickModal}
      </div>
    );
  }

  return (
    <div className="flex flex-auto flex-col lg:flex-row">
      {userIndex !== null && (
        <GameBoard id={id} game={game} userIndex={userIndex} />
      )}
      <div className="m-auto lg:m-0 flex-shrink-0 w-[200px] pt-2 lg:max-h-[calc(100vh-50px)] overflow-y-auto">
        {showingNudgeButton && (
          <div className="p-2 rounded-xl bg-primary flex flex-col mr-2">
            <p>Looks like the AI opponent is taking a long time to move</p>
            <Button onClick={onNudgeClick} className="text-white bg-darkbrown">
              Nudge the bot
            </Button>
          </div>
        )}
        <div className="flex flex-shrink-0 items-center text-darkbrown pt-2">
          <button
            onClick={() => {
              if (replayState) {
                return dispatch(clearReplay());
              }
            }}
          >
            <FontAwesomeIcon
              className={classNames(
                "mx-1 text-xl",
                replayState && "text-blue-500 hover:text-red-500"
              )}
              icon={replayState ? faPlayCircle : faHistory}
            />
          </button>
          <h3 className="flex-auto">
            <span className="text-2xl font-bold m-0">Turns</span>
          </h3>
        </div>
        <ul className="">
          {R.reverse(game.moves).map((move, i) => {
            const index = game.moves.length - i - 1;
            return <MoveListItem move={move} index={index} key={index} />;
          })}
        </ul>
      </div>
      {nickModal}
      {gameStateModal && (
        <GameStateModal
          {...gameStateModal}
          onDismiss={() => dispatch(dequeueOrDismissGameStateModalForGame(id))}
        />
      )}
    </div>
  );
};

export default Play;

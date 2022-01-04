import React, { useEffect, useState } from "react";
import * as R from "ramda";
import { Link, useParams } from "react-router-dom";
import classnames from "classnames";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { resetSelection, setCurrentGame } from "../game/gameSlice";
import { joinGameById } from "../gamelist/gamelistActions";
import GameBoard from "../game/GameBoard";
import CopyToClipboard from "../../presentational/CopyToClipboard";
import NicknameModal from "../user/NicknameModal";
import { useAppSelector } from "../../app/hooks";
import { fetchOpponent } from "../user/userActions";
import { initiateReplay } from "../game/gameActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDotCircle,
  faPlay,
  faPlayCircle,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";

const Play: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const game = useSelector((state: RootState) =>
    id ? state.gamelist.games[id] : null
  );
  const gamesLoaded = useSelector(
    (state: RootState) => state.gamelist.gamesLoaded
  );
  const currentUser = useSelector((state: RootState) => state.user.user);
  const replayState = useAppSelector((state) =>
    Boolean(state.game.replay.move)
  );
  const currentReplayIndex = useAppSelector(
    (state) => state.game.replay.moveListIndex
  );

  const [fourohfour, setFourohfour] = useState(false);

  const userIndex =
    game && currentUser
      ? game.users.findIndex((val) => val === currentUser.id)
      : null;

  const otherUser =
    game &&
    currentUser &&
    game.users.filter((user) => user !== currentUser.id)[0];

  const opponent = useAppSelector((state) =>
    otherUser ? state.user.opponents[otherUser] : null
  );

  useEffect(() => {
    dispatch(resetSelection());
    if (id) {
      console.log("set current game", id);
      dispatch(setCurrentGame(id));
    }
    return () => {
      dispatch(setCurrentGame(null));
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (gamesLoaded && !game && id) {
      // @ts-ignore
      dispatch(joinGameById(id)).then((joinedGame) => {
        console.log("joinedGame :", joinedGame);
        if (!joinedGame) {
          setFourohfour(true);
        }
      });
    } else {
      setFourohfour(false);
    }
  }, [id, dispatch, game, gamesLoaded]);

  useEffect(() => {
    if (game && otherUser && !opponent) {
      dispatch(fetchOpponent(otherUser));
    }
  }, [dispatch, game, otherUser, opponent]);

  const nickModal =
    currentUser && !currentUser.nickname ? <NicknameModal /> : null;

  if (fourohfour) {
    return (
      <div className="flex-shrink-0 lg:flex-shrink flex flex-auto flex-col h-screen justify-center items-center">
        <h1>404</h1>
        <Link className="underline text-blue-700" to="/">
          home
        </Link>
      </div>
    );
  }

  if (game && game.users.length === 1) {
    return (
      <div className="flex-shrink-0 lg:flex-shrink flex flex-auto flex-col h-screen justify-center items-center">
        <span className="text-2xl">Invite an opponent to start the game</span>
        <span>they can use this link to join you</span>
        <a
          className="underline text-blue-700"
          href={window.location.toString()}
        >
          {window.location.toString()}
        </a>
        <CopyToClipboard label="Copy link" text={window.location.toString()} />
        {nickModal}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-auto flex-col lg:flex-row">
      {game && id && userIndex !== null && (
        <GameBoard id={id} game={game} userIndex={userIndex} />
      )}
      {game && id && (
        <div className="m-auto flex flex-shrink-0 flex-col w-[200px] mt-2">
          <div className="flex items-center">
            <FontAwesomeIcon
              className={classNames(
                "mr-1 text-red-500 text-2xl",
                replayState && "text-blue-500"
              )}
              icon={replayState ? faPlayCircle : faDotCircle}
            />
            <h3 className="flex-auto">
              <span className="block m-0 mb-[-10px]">instant</span>
              <span className="text-2xl font-bold m-0 italic">REPLAY</span>
            </h3>
          </div>
          <ul className="flex-auto overflow-y-auto">
            {R.reverse(game.moves).map((move, i) => {
              const index = game.moves.length - i - 1;
              return (
              <li key={index} className="flex">
                <button
                  type="button"
                  className={classnames(
                    "flex-auto p-1 font-bold text-center rounded-md m-1 inset-shadow",
                    move.player === 0 ? "bg-p1" : "bg-p2",
                    replayState && currentReplayIndex === index && 'bg-blue-400 text-white'
                  )}
                  onClick={() => {
                    dispatch(initiateReplay(index, id));
                  }}
                >
                  {replayState && currentReplayIndex === index && (
                    <FontAwesomeIcon className="mr-2" icon={faPlay} />
                  )}
                  {move.letters.join("").toUpperCase()}
                </button>
              </li>
              )}
            )}
          </ul>
        </div>
      )}
      {nickModal}
    </div>
    // </div>
  );
};

export default Play;

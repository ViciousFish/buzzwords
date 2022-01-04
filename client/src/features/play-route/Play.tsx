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

  const nickModal = currentUser && !currentUser.nickname ? <NicknameModal /> : null;

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
      <div className="m-auto flex flex-shrink-0 flex-col w-[200px] mt-2">
        <h3 className="text-2xl text-center">Words Played</h3>
        <ul className="flex-auto overflow-y-auto">
          {game &&
            R.reverse(game.moves).map((move, i) => (
              <li
                key={i}
                className={classnames(
                  "p-1 font-bold text-center rounded-md m-1",
                  move.player === 0 ? "bg-p1" : "bg-p2"
                )}
              >
                {move.letters.join("").toUpperCase()}
              </li>
            ))}
        </ul>
      </div>
      {nickModal}
    </div>
    // </div>
  );
};

export default Play;

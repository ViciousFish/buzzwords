import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import classnames from "classnames";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { resetGame } from "../game/gameSlice";
import { joinGameById } from "../gamelist/gamelistActions";
import GameBoard from "../game/GameBoard";
import CopyToClipboard from "../../presentational/CopyToClipboard";

const Play: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const game = useSelector((state: RootState) => id ? state.gamelist.games[id] : null);
  const gamesLoaded = useSelector(
    (state: RootState) => state.gamelist.gamesLoaded
  );
  const currentUser = useSelector((state: RootState) => state.user.user);
  const [fourohfour, setFourohfour] = useState(false);

  const userIndex =
    game && currentUser
      ? game.users.findIndex((val) => val === currentUser.id)
      : null;

  useEffect(() => {
    dispatch(resetGame());
  }, [dispatch, id]);

  useEffect(() => {
    if (gamesLoaded && !game) {
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

  if (game && game.users.length === 1) {
    return (
      <div className="flex flex-auto flex-col h-screen justify-center items-center">
        <span className="text-2xl">Invite an opponent to start the game</span>
        <span>they can use this link to join you</span>
        <div>
          <a
            className="underline text-blue-700"
            href={window.location.toString()}
          >
            {window.location.toString()}
          </a>
          <CopyToClipboard text={window.location.toString()} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[80vh] md:h-screen flex flex-auto flex-col md:flex-row">
      {game && id && userIndex !== null && <GameBoard id={id} game={game} userIndex={userIndex} />}
      <div className="flex flex-shrink-0 flex-col w-[200px] mt-2">
        <h3 className="text-2xl">Words Played</h3>
        <ul className="flex-auto overflow-y-scroll">
          {game &&
            game.moves.map((move, i) => (
              <li
                key={i}
                className={classnames(
                  "p-1 text-center rounded-md m-1",
                  move.player === 0 ? "bg-p1" : "bg-p2"
                )}
              >
                {/* {move.player == userIndex ? "You" : "Them"}:{" "} */}
                {move.letters.join("").toUpperCase()}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Play;

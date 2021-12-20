import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import classnames from "classnames";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { resetGame } from "../game/gameSlice";
import { joinGameById } from "../gamelist/gamelistActions";
import GameBoard from "../game/GameBoard";

const Play: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const game = useSelector((state: RootState) => state.gamelist.games[id]);
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
    }
  }, [id, dispatch, game, gamesLoaded]);

  if (fourohfour) {
    return (
      <div className="flex h-full text-2xl justify-around items-center">
        <h1>404</h1>
        <Link to="/">home</Link>
      </div>
    );
  }
  return (
    <>
      <div className="flex justify-around">
        <Link className="btn" to="/">
          home
        </Link>
        <div>you are {userIndex === 0 ? "pink" : "green"}</div>
        {game && (
          <div className="block">
            it is {game?.turn === 0 ? "pinks" : "greens"} turn
          </div>
        )}
      </div>
      <div className="h-full flex flex-col lg:flex-row">
        {game && <GameBoard id={id} game={game} userIndex={userIndex} />}
        <div className="w-[200px] mt-2">
          <h3 className="text-2xl">Words Played</h3>
          <ul>
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
                  {move.letters.join("")}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Play;

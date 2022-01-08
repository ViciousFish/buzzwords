import {
  faBars,
  faCaretDown,
  faCaretRight,
  faHome,
  faPlus,
  faQuestion,
  faSpinner,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import { NavLink } from "react-router-dom";
import { animated as a, useSpring } from "@react-spring/web";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import { createNewGame } from "./gamelistActions";
import { toggleCompletedGames, toggleIsOpen } from "./gamelistSlice";
import ScreenHeightWraper from "../../presentational/ScreenHeightWrapper";
import { toggleTutorialModal } from "../game/gameSlice";
import GameListItem from "./GameListItem";

const CanvasLazy = React.lazy(() => import("../canvas/Canvas"));
const BeeLazy = React.lazy(() => import("../../assets/Bee"));
const HexWordLazy = React.lazy(() => import("../thereed-lettering/HexWord"));

const GameList: React.FC = () => {
  const dispatch = useAppDispatch();

  const games = useAppSelector((state) => state.gamelist.games);
  const gamesLoaded = useAppSelector((state) => state.gamelist.gamesLoaded);
  const isOpen = useAppSelector((state) => state.gamelist.isOpen);
  const showCompletedGames = useAppSelector(state => state.gamelist.showCompletedGames);


  const incompleteGames = Object.values(games).filter((game) => !game.gameOver);
  const completedGames = Object.values(games).filter((game) => game.gameOver);

  const safeAreaLeft = Number(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--sal")
      .replace(/\D/g, "")
  );

  const config = {
    tension: 200,
    clamp: true,
  };
  const containerSpring = useSpring({
    marginLeft: isOpen ? "0px" : `-${300 + safeAreaLeft}px`,
    config,
  });

  const hamburgerSpring = useSpring({
    transform: isOpen
      ? "translateX(0px)"
      : `translateX(${45 + safeAreaLeft}px)`,
    config,
  });

  return (
    <a.div
      className="w-[300px] flex-shrink-0 z-10 bg-darkbg"
      style={containerSpring}
    >
      <ScreenHeightWraper className="flex flex-col">
        <div className="flex flex-shrink-0 py-2 px-2 space-x-1 z-10">
          <a
            className="p-2 rounded-md block hover:bg-primary hover:bg-opacity-50 text-darkbrown"
            href="https://github.com/ViciousFish/buzzwords"
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon icon={faGithub} />
          </a>
          <a
            className="p-2 rounded-md block hover:bg-primary hover:bg-opacity-50 text-darkbrown"
            href="https://twitter.com/BuzzwordsGG"
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon icon={faTwitter} /> BuzzwordsGG
          </a>
          <div className="flex-auto" />
          <NavLink
            className={({ isActive }) =>
              classNames(
                isActive
                  ? "bg-primary hover:bg-opacity-100"
                  : "underline text-darkbrown",
                "p-2 rounded-md block hover:bg-primary hover:bg-opacity-50"
              )
            }
            to="/"
          >
            <FontAwesomeIcon icon={faHome} />
          </NavLink>
          <a.div style={hamburgerSpring}>
            <button
              onClick={() => dispatch(toggleIsOpen())}
              className="text-darkbrown p-2 hover:bg-primary hover:bg-opacity-50 rounded-md"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </a.div>
        </div>
        <div className="flex-auto flex flex-col overflow-y-auto">
          <div className="h-[150px] no-touch">
            <React.Suspense fallback={<></>}>
              <CanvasLazy>
                <BeeLazy position={[0, 5, 0]} scale={4} />
                <HexWordLazy position={[0, -6, 0]} text="BUZZWORDS" />
              </CanvasLazy>
            </React.Suspense>
          </div>
          <div className="flex-auto">
            <div className="px-2 mt-0 z-10">
              <h2 className="inline text-2xl font-bold text-darkbrown">
                Games
              </h2>
              <Button
                onClick={() => {
                  dispatch(createNewGame());
                }}
              >
                <FontAwesomeIcon className="mx-1" icon={faPlus} />
              </Button>
              <Button
                onClick={() => {
                  dispatch(toggleTutorialModal());
                }}
              >
                <FontAwesomeIcon className="mx-1" icon={faQuestion} />
              </Button>
            </div>
            {/* TODO: use useTransition to actually remove them from the dom on disappear? */}
            <ul className="px-2">
              {incompleteGames.map((game) => (
                <GameListItem key={game.id} game={game} />
              ))}
              {Object.keys(games).length === 0 && (
                <div className="p-2">
                  {!gamesLoaded && (
                    <>
                      <FontAwesomeIcon
                        className="animate-spin mr-2"
                        icon={faSpinner}
                      />
                      Loading games
                    </>
                  )}
                  {gamesLoaded && <>No games</>}
                </div>
              )}
            </ul>
            {completedGames.length ? (
              <div className="px-2 ">
                <button
                  className="flex items-center"
                  onClick={() => dispatch(toggleCompletedGames())}
                >
                  <FontAwesomeIcon
                    className={showCompletedGames ? "mr-1" : "mr-1 ml-1"}
                    icon={showCompletedGames ? faCaretDown : faCaretRight}
                  />
                  <h2 className="inline text-2xl font-bold text-darkbrown">
                    Completed Games
                  </h2>
                </button>
              </div>
            ) : null}
            {showCompletedGames && (
              <ul className="px-2">
                {completedGames.map((game) => (
                  <GameListItem key={game.id} game={game} />
                ))}
              </ul>
            )}
          </div>
          <div className="p-2 text-center text-gray-800 text-sm">
            by Chuck Dries and James Quigley
          </div>
        </div>
      </ScreenHeightWraper>
    </a.div>
  );
};

export default GameList;

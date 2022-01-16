import {
  faAngleDown,
  faAngleRight,
  faBars,
  faHome,
  faPlus,
  faQuestion,
  faSpinner,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import { NavLink } from "react-router-dom";
import { animated as a, useSpring } from "@react-spring/web";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import {
  setShowTutorialCard,
  toggleCompletedGames,
  toggleIsOpen,
} from "./gamelistSlice";
import ScreenHeightWraper from "../../presentational/ScreenHeightWrapper";
import GameListItem from "./GameListItem";
import TutorialCard from "./TutorialCard";
import PlayButtons from "../home-route/PlayButtons";
import { getHowManyGamesAreMyTurn } from "./gamelistSelectors";

const CanvasLazy = React.lazy(() => import("../canvas/Canvas"));
const BeeLazy = React.lazy(() => import("../../assets/Bee"));
const HexWordLazy = React.lazy(() => import("../thereed-lettering/HexWord"));

const GameList: React.FC = () => {
  const dispatch = useAppDispatch();

  const games = useAppSelector((state) => state.gamelist.games);
  const gamesLoaded = useAppSelector((state) => state.gamelist.gamesLoaded);
  const isOpen = useAppSelector((state) => state.gamelist.isOpen);
  const showCompletedGames = useAppSelector(
    (state) => state.gamelist.showCompletedGames
  );
  const showTutorialCard = useAppSelector(
    (state) => state.gamelist.showTutorialCard
  );
  const currentTurnCount = useAppSelector(getHowManyGamesAreMyTurn);

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
      : `translateX(${65 + safeAreaLeft}px)`,
    config,
  });

  return (
    <a.div
      className="w-[300px] flex-shrink-0 z-10 bg-darkbg"
      style={containerSpring}
    >
      <ScreenHeightWraper className="flex flex-col">
        <header className="z-10 flex flex-shrink-0 px-2 py-2 space-x-1">
          <a
            className="block p-2 rounded-md hover:bg-primary hover:bg-opacity-50 text-darkbrown"
            href="https://github.com/ViciousFish/buzzwords"
            target="_blank"
            rel="noreferrer"
            aria-label="buzzwords github"
            data-tip="Github repo"
          >
            <FontAwesomeIcon icon={faGithub} />
          </a>
          <a
            className="block p-2 rounded-md hover:bg-primary hover:bg-opacity-50 text-darkbrown"
            href="https://twitter.com/BuzzwordsGG"
            target="_blank"
            rel="noreferrer"
            aria-label="buzzwords twitter"
            data-tip="Follow us on twitter"
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
            aria-label="home"
            data-tip="Home"
          >
            <FontAwesomeIcon icon={faHome} />
          </NavLink>
          <a.div style={hamburgerSpring}>
            <button
              onClick={() => dispatch(toggleIsOpen())}
              aria-label="toggle games list"
              className="text-darkbrown p-2 hover:bg-primary hover:bg-opacity-50 rounded-md"
              data-tip="Toggle games list"
            >
              <FontAwesomeIcon icon={faBars} />
              {currentTurnCount && !isOpen ? <span className="text-sm ml-1" >({currentTurnCount})</span> : null}
            </button>
          </a.div>
        </header>
        <nav className="flex flex-col flex-auto overflow-y-auto">
          <div className="h-[150px] no-touch">
            <h1 style={{ display: "none" }}>Buzzwords</h1>
            <React.Suspense fallback={<></>}>
              <CanvasLazy>
                <BeeLazy position={[0, 5, 0]} scale={4} />
                <HexWordLazy autoSpin position={[0, -6, 0]} text="BUZZWORDS" />
              </CanvasLazy>
            </React.Suspense>
          </div>
          <div className="flex-auto">
            <div className="z-10 px-2 mt-0 flex items-center">
              <h2 className="text-2xl font-bold text-darkbrown">Games</h2>
              <div className="bg-primary mx-1 rounded-xl text-center flex items-center p-1">
                <h3 className="text-xs mr-1">New</h3>
                <div className="flex space-x-1">
                  <PlayButtons
                    mode="icon"
                    buttonClasses="bg-darkbrown text-white"
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  dispatch(setShowTutorialCard(true));
                }}
                aria-label="display tutorial"
                data-tip="Tutorial"
                className={classNames(
                  "w-[42px] h-[42px] inline-flex items-center justify-center",
                  showTutorialCard && "hidden"
                )}
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
                        className="mr-2 animate-spin"
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
                  className="flex items-center text-darkbrown"
                  onClick={() => dispatch(toggleCompletedGames())}
                >
                  <FontAwesomeIcon
                    className="mr-1"
                    icon={showCompletedGames ? faAngleDown : faAngleRight}
                  />
                  <h3 className="inline text-lg font-bold">Completed Games</h3>
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
          {showTutorialCard && <TutorialCard />}
          <div className="p-2 text-sm text-center text-gray-800">
            by Chuck Dries and James Quigley
          </div>
        </nav>
      </ScreenHeightWraper>
    </a.div>
  );
};

export default GameList;

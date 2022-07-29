// CQ: hide games you're not a member of from sidebar unless currently active route
// CQ: delete games you're not a member of from state when you navigate away?
import {
  faAngleDown,
  faAngleRight,
  faHome,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { animated as a, useSpring } from "@react-spring/web";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toggleCompletedGames } from "./gamelistSlice";
import ScreenHeightWraper from "../../presentational/ScreenHeightWrapper";
import GameListItem from "./GameListItem";
import TutorialCard from "./TutorialCard";
import PlayButtons from "../home-route/PlayButtons";
import ReactTooltip from "react-tooltip";

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

  return (
    <a.div
      className="w-[300px] flex-shrink-0 z-10"
      style={containerSpring}
    >
      <ScreenHeightWraper insetTop={50} className="flex flex-col bg-darkbg">
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
          >
            <FontAwesomeIcon icon={faTwitter} /> Follow us on Twitter
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
                    buttonVariant="dark"
                  />
                </div>
              </div>
            </div>
            {/* TODO: use useTransition to actually remove them from the dom on disappear? */}
            <ul className="px-2">
              {incompleteGames.map((game) => (
                <GameListItem key={game.id} game={game} />
              ))}
              {(Object.keys(games).length === 0 || !gamesLoaded) && (
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
                  className="flex items-center text-darkbrown w-full"
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
          {showTutorialCard && isOpen && <TutorialCard />}
          <div className="p-2 text-sm text-center text-gray-800">
            by{" "}
            <a className="underline" href="https://chuckdries.com">
              Chuck Dries
            </a>{" "}
            and{" "}
            <a
              className="underline"
              href="https://www.youtube.com/channel/UCBLK4r69Z_cRr087Jfvt0WQ"
            >
              James Quigley
            </a>
          </div>
        </nav>
      </ScreenHeightWraper>
    </a.div>
  );
};

export default GameList;

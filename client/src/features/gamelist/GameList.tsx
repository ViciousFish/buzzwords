// CQ: hide games you're not a member of from sidebar unless currently active route
// CQ: delete games you're not a member of from state when you navigate away?
import {
  faAngleDown,
  faAngleRight,
  faHome,
  faPlusCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import { NavLink } from "react-router-dom";

// CQx: took "main", review if this needs additional work
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toggleCompletedGames } from "./gamelistSlice";
import ScreenHeightWraper from "../../presentational/ScreenHeightWrapper";
import GameListItem from "./GameListItem";
import TutorialCard from "./TutorialCard";

// const CanvasLazy = React.lazy(() => import("../canvas/Canvas"));
import Canvas from "../canvas/Canvas";
const BeeLazy = React.lazy(() => import("../../assets/Bee"));
const HexWordLazy = React.lazy(() => import("../thereed-lettering/HexWord"));

const GameList: React.FC<{ hideBee: boolean }> = ({ hideBee }) => {
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

  return (
    <ScreenHeightWraper insetTop={50} className="flex flex-col bg-darkbg">
      <header className="flex flex-shrink-0 px-2 py-2 space-x-1">
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
          <FontAwesomeIcon icon={faTwitter} /> @BuzzwordsGG
        </a>
        <div className="flex-auto" />
        <NavLink
          className={({ isActive }) =>
            classNames(
              isActive ? "bg-primary hover:bg-opacity-100" : "underline",
              "p-2 rounded-md block hover:bg-primary hover:bg-opacity-50 text-darkbrown"
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
        {!hideBee && (
          <div className="h-[150px] no-touch">
            <React.Suspense fallback={<></>}>
              <Canvas>
                <BeeLazy position={[0, 5, 0]} scale={4} />
                <HexWordLazy autoSpin position={[0, -6, 0]} text="BUZZWORDS" />
              </Canvas>
            </React.Suspense>
          </div>
        )}
        <div className="flex-auto">
          <div className="z-10 px-2 mt-0 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-darkbrown">Games</h2>
            <NavLink
              to="/play/"
              className={({ isActive }) =>
                classNames(
                  "text-text text-sm p-2 rounded-full flex items-center",
                  "hover:bg-primary",
                  isActive ? "bg-primary" : "underline"
                )
              }
            >
              <FontAwesomeIcon
                icon={faPlusCircle}
                className="opacity-75 mr-2"
              />
              <span>New Game</span>
            </NavLink>
          </div>
          {/* TODO: use useTransition to actually remove them from the dom on disappear? */}
          <ul className="px-2 text-text">
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
        <div className="p-2 text-sm text-center text-text opacity-75">
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
  );
};

export default GameList;

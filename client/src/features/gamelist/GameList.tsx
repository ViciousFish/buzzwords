import {
  faBars,
  faHome,
  faPlus,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { animated as a, useSpring } from "@react-spring/web";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import { refresh, createNewGame } from "./gamelistActions";
import { toggleIsOpen } from "./gamelistSlice";
import ScreenHeightWraper from "../../presentational/ScreenHeightWrapper";
import { User } from "../user/userSlice";

const CanvasLazy = React.lazy(() => import("../canvas/Canvas"));
const BeeLazy = React.lazy(() => import("../../assets/Bee"));
const HexWordLazy = React.lazy(() => import("../thereed-lettering/HexWord"));

const GameList: React.FC = () => {
  const games = useAppSelector((state) => state.gamelist.games);
  const isOpen = useAppSelector((state) => state.gamelist.isOpen);
  const selfUser = useAppSelector((state) => state.user.user);
  const opponents = useAppSelector((state) => state.user.opponents);
  const dispatch = useAppDispatch();

  const allUsers: { [id: string]: User } = {
    ...opponents,
  };
  if (selfUser) {
    allUsers[selfUser.id] = selfUser;
  }

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
            href="https://github.com/chuckdries/buzzwords"
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
          <div className="h-[150px]">
            <React.Suspense fallback={<></>}>
              <CanvasLazy>
                <BeeLazy position={[0, 5, 0]} scale={4} />
                <HexWordLazy position={[0, -6, 0]} text="BUZZWORDS" />
              </CanvasLazy>
            </React.Suspense>
          </div>
          <div className="px-2 mt-0 z-10">
            <h2 className="inline text-2xl font-bold text-darkbrown">Games</h2>
            <Button
              onClick={() => {
                dispatch(createNewGame());
              }}
            >
              <FontAwesomeIcon className="mx-1" icon={faPlus} />
            </Button>
            <Button
              onClick={() => {
                dispatch(refresh());
              }}
            >
              <FontAwesomeIcon className="mx-1" icon={faSync} />
            </Button>
          </div>
          {/* TODO: use useTransition to actually remove them from the dom on disappear? */}
          <ul className="px-2 flex-auto">
            {Object.keys(games).map((id) => {
              const users = games[id].users;
              const nick1 = allUsers[users[0]]?.nickname ?? "???";
              const nick2 = allUsers[users[1]]?.nickname ?? "???";
              return (
                <li key={id} className="my-1 whitespace-nowrap">
                  <NavLink
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? "bg-primary hover:bg-opacity-100"
                          : "underline text-darkbrown",
                        "p-2 rounded-xl block hover:bg-primary hover:bg-opacity-50"
                      )
                    }
                    to={`/play/${id}`}
                  >
                    {nick1} vs {nick2}
                  </NavLink>
                </li>
              );
            })}
            {Object.keys(games).length === 0 && <>No games</>}
          </ul>
          <div className="p-2 text-center text-gray-800 text-sm">
            by Chuck Dries and James Quigley
          </div>
        </div>
      </ScreenHeightWraper>
    </a.div>
  );
};

export default GameList;

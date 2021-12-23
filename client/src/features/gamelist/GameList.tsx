import {
  faArrowsRotate,
  faBars,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
// import {
//   animated as a,
//   config as springConfig,
//   useSpring,
//   useTransition,
// } from "@react-spring/web";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import { getUser } from "../user/userActions";
import { refresh, createNewGame } from "./gamelistActions";
import { toggleIsOpen } from "./gamelistSlice";
// import { theme } from "../../app/theme";

export function GameList() {
  const games = useAppSelector((state) => Object.keys(state.gamelist.games));
  const isOpen = useAppSelector((state) => state.gamelist.isOpen);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(refresh());
    dispatch(getUser());
  }, [dispatch]);

  // const config = {
  //   tension: 200,
  //   clamp: true,
  // };
  const containerSpring = {
    marginLeft: isOpen ? "0" : "-300px",
  };

  const hamburgerSpring = {
    marginRight: isOpen ? "0" : "-45px",
  };

  return (
    <div
      className="w-[300px] flex-shrink-0 z-10 h-screen bg-darkbg"
      style={containerSpring}
    >
      <div className="px-2">
        <div className="flex py-2 space-x-2">
          <div className="flex-auto">
            <NavLink
              className={({ isActive }) =>
                classNames(
                  // isActive
                  //   ? "bg-primary hover:bg-opacity-100"
                  //   : "underline text-darkbrown",
                  "p-2 rounded-md block hover:bg-primary hover:bg-opacity-50 text-2xl"
                )
              }
              to="/"
            >
              Buzzwords
            </NavLink>
          </div>
          <div style={hamburgerSpring}>
            <button
              onClick={() => dispatch(toggleIsOpen())}
              className="p-2 hover:bg-primary hover:bg-opacity-50 rounded-md"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </div>
        <div className="px-2">
          <span className="text-xl">Games</span>
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
            <FontAwesomeIcon className="mx-1" icon={faArrowsRotate} />
          </Button>
        </div>
        {/* TODO: use useTransition to actually remove them from the dom on disappear? */}
        <ul className="px-2">
          {games.map((id) => (
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
                {id}
              </NavLink>
            </li>
          ))}
          {games.length === 0 && <>No games</>}
        </ul>
      </div>
    </div>
  );
}

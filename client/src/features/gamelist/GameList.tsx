import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { animated as a, useSpring, useTransition } from "@react-spring/web";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import { getUser } from "../user/userActions";
import { refresh, createNewGame } from "./gamelistActions";
import { toggleIsOpen } from "./gamelistSlice";
import { theme } from "../../app/theme";

export function GameList() {
  const games = useAppSelector((state) => Object.keys(state.gamelist.games));
  const isOpen = useAppSelector((state) => state.gamelist.isOpen);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(refresh());
    dispatch(getUser());
  }, [dispatch]);

  const containerSpring = useSpring({
    marginLeft: isOpen ? "0" : "-260px",
    background: isOpen ? theme.colors.darkbg : theme.colors.lightbg,
  });

  const innerSpring = useSpring({
    opacity: isOpen ? 1 : 0,
  });

  return (
    <a.div
      className="w-[300px] flex-shrink-0 z-10 h-screen"
      style={containerSpring}
    >
      <div className="px-2">
        <div className="flex py-2 space-x-2">
          <a.div className="flex-auto" style={innerSpring}>
            <NavLink
              className={({ isActive }) =>
                classNames(
                  isActive
                    ? "bg-primary hover:bg-opacity-100"
                    : "underline text-darkbrown",
                  "p-2 rounded-md block hover:bg-primary hover:bg-opacity-50 text-2xl"
                )
              }
              to="/"
            >
              Buzzwords
            </NavLink>
          </a.div>
          <button
            onClick={() => dispatch(toggleIsOpen())}
            className="p-2 hover:bg-primary hover:bg-opacity-50 rounded-md"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        <a.div style={innerSpring}>
          <span className="text-xl">Games</span>
          <Button
            onClick={() => {
              dispatch(createNewGame());
            }}
          >
            Create new
          </Button>
          {isOpen && (
            <Button
              onClick={() => {
                dispatch(refresh());
              }}
            >
              refresh
            </Button>
          )}
        </a.div>
        {/* TODO: use useTransition to actually remove them from the dom on disappear? */}
        <a.ul style={innerSpring}>
          {games.map((id) => (
            <li key={id} className="my-1 whitespace-nowrap">
              <NavLink
                className={({ isActive }) =>
                  classNames(
                    isActive
                      ? "bg-primary hover:bg-opacity-100"
                      : "underline text-darkbrown",
                    "p-2 rounded-md block hover:bg-primary hover:bg-opacity-50"
                  )
                }
                to={`/play/${id}`}
              >
                {id}
              </NavLink>
            </li>
          ))}
          {games.length === 0 && <>No games</>}
        </a.ul>
      </div>
    </a.div>
  );
}

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

export function GameList() {
  const games = useAppSelector((state) => Object.keys(state.gamelist.games));
  const isOpen = useAppSelector((state) => state.gamelist.isOpen);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(refresh());
    dispatch(getUser());
  }, [dispatch]);

  const transitions = useTransition(isOpen ? games : [], {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  const marginSpring = useSpring({ marginLeft: isOpen ? "0" : "-250px" });
  return (
    <a.div
      className="bg-darkbg inset-right w-[300px] flex-shrink-0"
      style={marginSpring}
    >
      <div className="px-2">
        <div className="flex py-2 space-x-2">
          {isOpen ? (
            <NavLink
              className={({ isActive }) =>
                classNames(
                  isActive
                    ? "bg-primary hover:bg-opacity-100"
                    : "underline text-darkbrown",
                  "p-2 rounded-md flex-auto hover:bg-primary hover:bg-opacity-50 text-2xl"
                )
              }
              to="/"
            >
              Buzzwords
            </NavLink>
          ) : (
            <div className="p-2 flex-auto text-2xl">Buzzwords</div>
          )}
          <button
            onClick={() => dispatch(toggleIsOpen())}
            className="p-2 hover:bg-primary hover:bg-opacity-50 rounded-md"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        <div>
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
        </div>
        <ul>
          {transitions((styles, id) => (
            <a.li style={styles} className="my-1 whitespace-nowrap">
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
            </a.li>
          ))}
          {games.length === 0 && <>No games</>}
        </ul>
      </div>
    </a.div>
  );
}

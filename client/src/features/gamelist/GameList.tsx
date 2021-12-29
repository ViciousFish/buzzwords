import {
  faArrowsRotate,
  faBars,
  faHome,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { animated as a, useSpring } from "@react-spring/web";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import { getUser } from "../user/userActions";
import { refresh, createNewGame } from "./gamelistActions";
import { toggleIsOpen } from "./gamelistSlice";

const CanvasLazy = React.lazy(() => import("../canvas/Canvas"));
const BeeLazy = React.lazy(() => import("../../assets/Bee"));
const HexWordLazy = React.lazy(() => import("../thereed-lettering/HexWord"));

const GameList: React.FC = () => {
  const games = useAppSelector((state) => Object.keys(state.gamelist.games));
  const isOpen = useAppSelector((state) => state.gamelist.isOpen);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(refresh());
    dispatch(getUser());
  }, [dispatch]);

  const config = {
    tension: 200,
    clamp: true,
  };
  const containerSpring = useSpring({
    marginLeft: isOpen ? "0" : "-300px",
    config,
  });

  const hamburgerSpring = useSpring({
    marginRight: isOpen ? "0" : "-45px",
    config,
  });

  return (
    <a.div
      className="w-[300px] flex-shrink-0 z-10 h-screen bg-darkbg"
      style={containerSpring}
    >
      <div className="px-2 h-full flex flex-col">
        <div className="flex py-2 space-x-2 z-10">
          <div className="flex-auto"></div>
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
              className=" p-2 hover:bg-primary hover:bg-opacity-50 rounded-md"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </a.div>
        </div>
        <div className="mt-[-2em]">
          <React.Suspense fallback={<></>}>
            <CanvasLazy>
              <BeeLazy position={[0, 7, 0]} scale={4} />
              <HexWordLazy position={[0, -5, 0]} text="BUZZWORDS" />
            </CanvasLazy>
          </React.Suspense>
        </div>
        <div className="px-2 mt-[-2em] z-10">
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
        <ul className="px-2 flex-auto">
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
    </a.div>
  );
};

export default GameList;

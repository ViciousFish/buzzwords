import React, { useEffect } from "react";
import { Outlet } from "react-router";
import { animated as a, useTransition, useSpringRef } from "@react-spring/web";

import GameList from "../features/gamelist/GameList";
import TopBar from "../features/topbar/TopBar";
import ScreenHeightWraper from "../presentational/ScreenHeightWrapper";
import SidebarRightSide from "./SidebarRightSide";
import { useAppDispatch, useAppSelector } from "./hooks";
import { useDrag } from "@use-gesture/react";
import {
  setShowTutorialCard,
  toggleIsOpen,
} from "../features/gamelist/gamelistSlice";

const MainGameStructure: React.FC = () => {
  const dispatch = useAppDispatch();
  const gamelistIsOpen = useAppSelector((state) => state.gamelist.isOpen);

  const safeAreaLeft = Number(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--sal")
      .replace(/\D/g, "")
  );
  const mlValue = 300 + safeAreaLeft;
  const marginLeft = `-${mlValue}px`;

  const transRef = useSpringRef();

  const sidebarTransition = useTransition(gamelistIsOpen, {
    ref: transRef,
    initial: {
      marginLeft: "0px",
    },
    from: {
      marginLeft,
    },
    enter: {
      marginLeft: "0px",
    },
    leave: {
      marginLeft,
    },
    config: {
      tension: 200,
      clamp: true,
    },
  });

  // undocumented: you must manually start the animation for useTransition when passing a ref
  useEffect(() => {
    if (gamelistIsOpen) {
      transRef.current[1].start();
    } else if (transRef.current.length == 2) {
      transRef.current[1].start();
    }
  }, [gamelistIsOpen, transRef]);

  const bind = useDrag(({ down, movement: [mx, my], direction }) => {
    if (mx < 0) {
      if (down) {
        transRef.current[1].set({
          marginLeft: `${mx}px`,
        });
      } else {
        dispatch(toggleIsOpen());
        if (gamelistIsOpen) {
          dispatch(setShowTutorialCard(false));
        }
      }
    }
  });

  return (
    <ScreenHeightWraper className="flex flex-col">
      <TopBar />
      <div
        style={{ display: "flex" }}
        className="bg-lightbg mt-[50px] overflow-hidden max-w-[100vw] flex-row safe-area-pad flex-auto"
      >
        {sidebarTransition(
          (styles, item) =>
            item && (
              <a.div className="w-[300px] flex-shrink-0 z-10" style={styles}>
                <GameList />
              </a.div>
            )
        )}
        <SidebarRightSide bindOverlayArgs={bind()}>
          <Outlet />
        </SidebarRightSide>
      </div>
    </ScreenHeightWraper>
  );
};

export default MainGameStructure;

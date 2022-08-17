import React, { useEffect, useRef } from "react";
import { Outlet } from "react-router";
import { animated as a, useTransition, useSpringRef } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import useBreakpoint from "use-breakpoint";

import GameList from "../features/gamelist/GameList";
import TopBar from "../features/topbar/TopBar";
import ScreenHeightWraper from "../presentational/ScreenHeightWrapper";
import SidebarRightSide from "./SidebarRightSide";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  setShowTutorialCard,
  toggleIsOpen,
} from "../features/gamelist/gamelistSlice";

// default tailwind breakpoints
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const MainGameStructure: React.FC = () => {
  const dispatch = useAppDispatch();
  const gamelistIsOpen = useAppSelector((state) => state.gamelist.isOpen);

  const { breakpoint } = useBreakpoint(BREAKPOINTS);
  const mobileLayout = breakpoint === "xs" || breakpoint === "sm";

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

  const isDown = useRef(false);

  useEffect(() => {
    if (isDown.current) {
      return;
    }
    // undocumented: you must manually start the animation for useTransition when passing a ref
    if (gamelistIsOpen) {
      transRef.current.forEach((transition) => transition.start());
    } else {
      transRef.current.forEach((transition) => transition.start());
    }
  }, [gamelistIsOpen, transRef]);

  const offset = useRef(0);
  const bind = useDrag(({ down, movement: [mx], distance: [dx] }) => {
    if (!mobileLayout) {
      return;
    }
    if (down) {
      isDown.current = true;
      if (mx > 0 && !gamelistIsOpen) {
        dispatch(toggleIsOpen());
        offset.current = -1 * mlValue;
        return;
      }
      if (!transRef.current[1]) {
        return;
      }
      transRef.current[1].set({
        marginLeft: `${Math.min(0, mx + offset.current)}px`,
      });
    } else {
      isDown.current = false;
      if (dx > 10) {
        if (mx < 0 && gamelistIsOpen) {
          // finish closing
          dispatch(toggleIsOpen());
          if (gamelistIsOpen) {
            dispatch(setShowTutorialCard(false));
          }
        } else {
          // finish opening
          transRef.current.forEach((transition) =>
            transition.start({ marginLeft: "0px" })
          );
          offset.current = 0;
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
                <GameList hideBee={mobileLayout} />
              </a.div>
            )
        )}
        <SidebarRightSide mobileLayout={mobileLayout} bindDragArgs={bind()}>
          <Outlet />
        </SidebarRightSide>
      </div>
    </ScreenHeightWraper>
  );
};

export default MainGameStructure;

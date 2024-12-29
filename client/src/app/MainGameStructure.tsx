import React, { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router";
import { animated as a, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import useBreakpoint from "use-breakpoint";

import GameList from "../features/gamelist/GameList";
import TopBar from "../features/topbar/TopBar";
import ScreenHeightWraper from "../presentational/ScreenHeightWrapper";
import SidebarRightSide from "./SidebarRightSide";
import { useAppDispatch, useAppSelector } from "./hooks";
import { toggleIsOpen } from "../features/gamelist/gamelistSlice";
import { raf } from "@react-spring/shared";

// default tailwind breakpoints
export const BREAKPOINTS = {
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
  const lowPowerMode = useAppSelector(({ settings }) => settings.lowPowerMode);

  const [renderSidebar, setRenderSidebar] = useState(gamelistIsOpen);

  const { breakpoint } = useBreakpoint(BREAKPOINTS);
  const mobileLayout = breakpoint === "xs" || breakpoint === "sm";

  const safeAreaLeft = Number(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--sal")
      .replace(/\D/g, "")
  );
  const mlValue = -1 * (300 + safeAreaLeft);

  const sidebarSpring = useSpring({
    marginLeft: gamelistIsOpen ? 0 : mlValue,
    config: {
      tension: 200,
      clamp: true,
    },
    onRest: () => {
      setRenderSidebar(gamelistIsOpen);
    },
    onChange: () => {
      // requestAnimationFrame(() => raf.advance())
      if (!renderSidebar) {
        setRenderSidebar(true);
      }
    },
    immediate: lowPowerMode,
  });

  useEffect(() => {
    // requestAnimationFrame(() => raf.advance());
  }, [gamelistIsOpen]);

  const isDown = useRef(false);

  const bind = useDrag(
    ({ down, distance: [x], delta: [dx], movement: [mx] }) => {
      if (!mobileLayout) {
        return;
      }
      if ((gamelistIsOpen && mx > 0) || (!gamelistIsOpen && mx < 0)) {
        return;
      }
      // requestAnimationFrame(() => raf.advance())
      if (down) {
        isDown.current = true;
        sidebarSpring.marginLeft.set(
          Math.min(0, dx + sidebarSpring.marginLeft.get())
        );
      } else {
        if (x > 40 || (gamelistIsOpen && x < 2)) {
          dispatch(toggleIsOpen());
        } else {
          sidebarSpring.marginLeft.start(gamelistIsOpen ? 0 : mlValue);
        }
      }
    }
  );

  const colors = (<><div className="flex">
    {[
      "bg-beeYellow-100",
      "bg-beeYellow-200",
      "bg-beeYellow-300",
      "bg-beeYellow-400",
      "bg-beeYellow-500",
      "bg-beeYellow-510",
      "bg-beeYellow-600",
      "bg-beeYellow-700",
      "bg-beeYellow-800",
      "bg-beeYellow-900",
      "bg-beeYellow-950",
    ].map((className) => (
      <div
        key={className}
        className={`p-2 flex-auto ${className} flex items-center justify-center`}
      >
        {className.split('-')[2]}
      </div>
    ))}
  </div>
  <div className="flex justify-stretch bg-black">
    {[
      "bg-bYellow-100",
      "bg-bYellow-200",
      "bg-bYellow-300",
      "bg-bYellow-400",
      "bg-bYellow-500",
      "bg-bYellow-600",
      "bg-bYellow-700",
      "bg-bYellow-800",
      "bg-bYellow-900",
      "bg-bBrown-100",
      "bg-bBrown-200",
      "bg-bBrown-300",
      "bg-bBrown-400",
      "bg-bBrown-500",
      "bg-bBrown-600",
      "bg-bBrown-700",
      "bg-bBrown-800",
      "bg-bBrown-900",
      "bg-bBrown-950",
    ].map((className) => (
      <div
        key={className}
        className={`p-2 flex-auto ${className} flex items-center justify-center`}
      >
        {className.split('-')[2]}
      </div>
    ))}
  </div></>)

  return (
    <ScreenHeightWraper className="grid grid-rows-[min-content_minmax(0_auto)] relative overflow-hidden">
      <TopBar />
      <div className="bg-beeYellow-300 dark:bg-beeYellow-950 mt-[50px] overflow-hidden max-w-[100vw] flex flex-row safe-area-pad flex-auto">
        <a.div
          className="w-[300px] flex-shrink-0 z-30"
          style={{ marginLeft: sidebarSpring.marginLeft }}
        >
          <GameList />
        </a.div>
        <SidebarRightSide mobileLayout={mobileLayout} bindDragArgs={bind()}>
          <Outlet />
        </SidebarRightSide>
      </div>
      {/* {colors} */}
    </ScreenHeightWraper>
  );
};

export default MainGameStructure;

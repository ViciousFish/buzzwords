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

  return (
    <ScreenHeightWraper className="grid grid-rows-[min-content_minmax(0_auto)] relative overflow-hidden">
      <TopBar />
      <div className="bg-lightbg mt-[50px] overflow-hidden max-w-[100vw] flex flex-row safe-area-pad flex-auto">
        <a.div
          className="w-[300px] flex-shrink-0 z-30"
          style={{ marginLeft: sidebarSpring.marginLeft }}
        >
          <GameList />
        </a.div>
        <SidebarRightSide
          mobileLayout={mobileLayout}
          // bindDragArgs={bind()}
        >
          <Outlet />
        </SidebarRightSide>
      </div>
    </ScreenHeightWraper>
  );
};

export default MainGameStructure;

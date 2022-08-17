import React, { useState, useRef } from "react";
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
      if (!renderSidebar) {
        setRenderSidebar(true);
      }
    },
  });

  const isDown = useRef(false);

  const bind = useDrag(({ down, distance: [x], delta: [dx] }) => {
    if (!mobileLayout) {
      return;
    }
    if (down) {
      isDown.current = true;
      sidebarSpring.marginLeft.set(
        Math.min(0, dx + sidebarSpring.marginLeft.get())
      );
    } else {
      if (x > 40 || (gamelistIsOpen && x < 2)) {
        dispatch(toggleIsOpen());
      } else {
        sidebarSpring.marginLeft.start(gamelistIsOpen ? 0 : mlValue)
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
        <a.div
          className="w-[300px] flex-shrink-0 z-10"
          style={{ marginLeft: sidebarSpring.marginLeft }}
        >
          {renderSidebar && <GameList hideBee={mobileLayout} />}
        </a.div>
        <SidebarRightSide mobileLayout={mobileLayout} bindDragArgs={bind()}>
          <Outlet />
        </SidebarRightSide>
      </div>
    </ScreenHeightWraper>
  );
};

export default MainGameStructure;

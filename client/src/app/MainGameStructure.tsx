import React from "react";
import { Outlet } from "react-router";
import { animated as a, useTransition } from "@react-spring/web";

import GameList from "../features/gamelist/GameList";
import TopBar from "../features/topbar/TopBar";
import ScreenHeightWraper from "../presentational/ScreenHeightWrapper";
import SidebarRightSide from "./SidebarRightSide";
import { useAppSelector } from "./hooks";

const MainGameStructure: React.FC = () => {
  const gamelistIsOpen = useAppSelector((state) => state.gamelist.isOpen);

  // const {observe, height, width} = useDimensions()

  const safeAreaLeft = Number(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--sal")
      .replace(/\D/g, "")
  );
  const config = {
    tension: 200,
    clamp: true,
  };
  const marginLeft = `-${300 + safeAreaLeft}px`;
  const sidebarTransition = useTransition(gamelistIsOpen, {
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
    config,
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
        <SidebarRightSide>
          <Outlet />
        </SidebarRightSide>
      </div>
    </ScreenHeightWraper>
  );
};

export default MainGameStructure;

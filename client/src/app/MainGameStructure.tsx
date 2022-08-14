import React from "react";
import { Outlet } from "react-router";
import GameList from "../features/gamelist/GameList";
import TopBar from "../features/topbar/TopBar";
import ScreenHeightWraper from "../presentational/ScreenHeightWrapper";
import SidebarRightSide from "./SidebarRightSide";

const MainGameStructure: React.FC = () => {
  // const {observe, height, width} = useDimensions()
  return (
    <ScreenHeightWraper className="flex flex-col">
      <TopBar />
      <div
        style={{ display: "flex" }}
        className="bg-lightbg1 dark:bg-darkbg1 mt-[50px] overflow-hidden max-w-[100vw] flex-row safe-area-pad flex-auto"
      >
        <GameList />
        <SidebarRightSide>
          <Outlet />
        </SidebarRightSide>
      </div>
    </ScreenHeightWraper>
  );
};

export default MainGameStructure;

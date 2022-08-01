import React from "react";
import { Outlet } from "react-router";
import GameList from "../features/gamelist/GameList";
import TopBar from "../features/topbar/TopBar";
import SidebarRightSide from "./SidebarRightSide";

const MainGameStructure: React.FC = () => (
  <>
    <TopBar />
    <div
      style={{ display: "flex" }}
      className="bg-lightbg mt-[50px] overflow-hidden max-w-[100vw] flex-row safe-area-pad h-[calc(100vh-50px)]"
    >
      {/* TODO: don't render gamelist, topbar, etc for /auth/success */}
      <GameList />
      <SidebarRightSide>
        <Outlet />
      </SidebarRightSide>
    </div>
  </>
);

export default MainGameStructure;

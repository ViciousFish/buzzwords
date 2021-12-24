import classNames from "classnames";
import React, { useCallback } from "react";
import { Outlet } from "react-router-dom";
import useBreakpoint from "use-breakpoint";
import { toggleIsOpen } from "../features/gamelist/gamelistSlice";
import { useAppDispatch, useAppSelector } from "./hooks";

const BREAKPOINTS = {
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
}

const SidebarRightSide: React.FC = ({ children }) => {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.gamelist.isOpen);

  const { breakpoint } = useBreakpoint(BREAKPOINTS)

  const onClick = useCallback(() => dispatch(toggleIsOpen()), [dispatch]);

  return (
    <div className={classNames("flex-auto overflow-scroll h-screen", isSidebarOpen && 'flex-shrink-0 md:flex-shrink')}>
      {children}
      {isSidebarOpen && breakpoint === 'sm' && (
        <div
          className="absolute top-0 right-0 bottom-0 left-0"
          style={{ opacity: 0.5, background: "black" }}
          onClick={onClick}
        ></div>
      )}
    </div>
  );
};

export default SidebarRightSide;
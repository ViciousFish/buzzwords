import classNames from "classnames";
import React, { ReactNode, useCallback } from "react";
import useBreakpoint from "use-breakpoint";
import { animated as a, useTransition } from "@react-spring/web";

import { toggleIsOpen } from "../features/gamelist/gamelistSlice";
import { useAppDispatch, useAppSelector } from "./hooks";
import { ReactDOMAttributes } from "@use-gesture/core/types";

// default tailwind breakpoints
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const SidebarRightSide: React.FC<{
  children: ReactNode;
  bindDragArgs: ReactDOMAttributes;
}> = ({ children, bindDragArgs }) => {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.gamelist.isOpen);

  const { breakpoint } = useBreakpoint(BREAKPOINTS);

  const onClick = useCallback(() => dispatch(toggleIsOpen()), [dispatch]);

  const breakcond = breakpoint === "xs" || breakpoint === "sm";
  const condition = isSidebarOpen && breakcond;

  const rightsideOverlayTransition = useTransition(condition, {
    from: { opacity: 0 },
    enter: { opacity: 0.5 },
    leave: { opacity: 0 },
  });

  return (
    <div
      className={classNames(
        "flex-auto overflow-auto h-full touch-none",
        breakcond && "min-w-[100vw]"
      )}
      {...bindDragArgs}
    >
      {children}
      {rightsideOverlayTransition((styles, value) => (
        value && <a.div
          className="fixed top-[calc(50px+var(--sat))] right-0 h-full left-0 bg-black"
          onClick={isSidebarOpen ? onClick : undefined}
          style={styles}
        ></a.div>
      ))}
    </div>
  );
};

export default SidebarRightSide;

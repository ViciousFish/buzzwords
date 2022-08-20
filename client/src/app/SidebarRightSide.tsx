import classNames from "classnames";
import React, { ReactNode } from "react";
import { animated as a, useTransition } from "@react-spring/web";

import { useAppSelector } from "./hooks";
import { ReactDOMAttributes } from "@use-gesture/core/types";
// import { raf } from "@react-spring/shared";

const SidebarRightSide: React.FC<{
  children: ReactNode;
  mobileLayout: boolean;
  bindDragArgs: ReactDOMAttributes;
}> = ({ children, mobileLayout, bindDragArgs }) => {
  const isSidebarOpen = useAppSelector((state) => state.gamelist.isOpen);

  const condition = isSidebarOpen && mobileLayout;

  const rightsideOverlayTransition = useTransition(condition, {
    from: { opacity: 0 },
    enter: { opacity: 0.5 },
    leave: { opacity: 0 },
    config: {
      tension: 200,
      clamp: true,
    },
    onChange: () => {
      // handled by maingamestructure
      // requestAnimationFrame(() => raf.advance())
    },
  });

  return (
    <div
      className={classNames(
        "flex-auto overflow-hidden h-full touch-none relative",
        mobileLayout && "min-w-[100vw]"
      )}
      {...bindDragArgs}
    >
      {children}
      {rightsideOverlayTransition(
        (styles, value) =>
          value && (
            <a.div
              id="shade"
              className="fixed top-[calc(50px+var(--sat))] right-0 h-full left-0 bg-black"
              style={styles}
            ></a.div>
          )
      )}
    </div>
  );
};

export default SidebarRightSide;

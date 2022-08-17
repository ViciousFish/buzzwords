import React, { useEffect, useRef } from "react";
import { Outlet } from "react-router";
import {
  animated as a,
  useTransition,
  useSpringRef,
  useSpring,
} from "@react-spring/web";
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
  const mlValue = -1 * (300 + safeAreaLeft);
  const marginLeft = `${mlValue}px`;

  const transRef = useSpringRef();
  // const springRef = useSpringRef();

  const offset = useRef(0);
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
    onRest: () => {
      console.log("rest");
      offset.current = 0;
    },
  });

  const sidebarSpring = useSpring({
    marginLeft: gamelistIsOpen ? 0 : mlValue,
    config: {
      tension: 200,
      clamp: true,
    },
    onRest: () => {
      console.log("rest");
      offset.current = 0;
    },
    onChange: (arg) => {
      // offset.current = arg.value
      console.log(arg.value)
    }
  });

  const isDown = useRef(false);

  // useEffect(() => {
  //   if (isDown.current) {
  //     return;
  //   }
  //   // undocumented: you must manually start the animation for useTransition when passing a ref
  //   if (gamelistIsOpen) {
  //     transRef.current.filter(transition => transition.item).forEach((transition) => transition.start());
  //   } else {
  //     transRef.current.filter(transition => transition.item).forEach((transition) => transition.start());
  //   }
  // }, [gamelistIsOpen, transRef]);

  const bind = useDrag(({ down, movement: [mx], delta: [dx] }) => {
    if (!mobileLayout) {
      return;
    }
    if (down) {
      isDown.current = true;
      // transRef.current.forEach(trans => trans.pause())
      // if (mx > 0 && !gamelistIsOpen) {
      //   // dispatch(toggleIsOpen());
      //   offset.current = -1 * mlValue;
      //   // return;
      // }
      // if (!transRef.current[1]) {
      //   return;
      // }
      // transRef.current
      //   .filter((trans) => trans.item && gamelistIsOpen)
      //   .forEach((trans) =>
      //     trans.set({
      //       marginLeft: `${Math.min(0, mx + offset.current)}px`,
      //     })
      //   );
      offset.current = sidebarSpring.marginLeft.get()
      sidebarSpring.marginLeft.set(Math.min(0, dx + offset.current));
    } else {
      dispatch(toggleIsOpen());

      // sidebarSpring.marginLeft.start(gamelistIsOpen ? "0px" : marginLeft)
      // isDown.current = false;
      // if (dx > 10) {
      //   if (mx < 0 && gamelistIsOpen) {
      //     // finish closing
      //     dispatch(toggleIsOpen());
      //     if (gamelistIsOpen) {
      //       dispatch(setShowTutorialCard(false));
      //     }
      //   } else {
      //     // finish opening
      //     transRef.current.forEach(
      //       (transition) => transition.start()
      //       // .then(() => offset.current = 0)
      //     );
      //     // offset.current = 0;
      //   }
      // }
    }
  });

  return (
    <ScreenHeightWraper className="flex flex-col">
      <TopBar />
      <div
        style={{ display: "flex" }}
        className="bg-lightbg mt-[50px] overflow-hidden max-w-[100vw] flex-row safe-area-pad flex-auto"
      >
        {/* {sidebarTransition(
          (styles, item) =>
            item && (
              <a.div className="w-[300px] flex-shrink-0 z-10" style={styles}>
                <GameList hideBee={mobileLayout} />
              </a.div>
            )
        )} */}
        <a.div className="w-[300px] flex-shrink-0 z-10" style={sidebarSpring}>
          <GameList hideBee={mobileLayout} />
        </a.div>
        <SidebarRightSide mobileLayout={mobileLayout} bindDragArgs={bind()}>
          <Outlet />
        </SidebarRightSide>
      </div>
    </ScreenHeightWraper>
  );
};

export default MainGameStructure;

import React, { useCallback, useState } from "react";
import * as R from "ramda";
import { useSpring } from "@react-spring/three";
import { toast } from "react-toastify";
import { animated as a } from "@react-spring/web";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { nudgeGameById } from "./gameActions";
import { clearReplay, toggleNudgeButton } from "./gameSlice";
import { use100vh } from "react-div-100vh";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLines, faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { useDrag } from "@use-gesture/react";
import classNames from "classnames";
import MoveListItem from "./MoveListItem";
import { isFullGame } from "../gamelist/gamelistSlice";

interface MoveListProps {
  id: string;
}

export function MoveList({ id }: MoveListProps) {
  const dispatch = useAppDispatch();
  const showingNudgeButton = useAppSelector(
    (state) => state.game.showingNudgeButton
  );
  const replayState = useAppSelector((state) => state.game.replay.move);
  const replayIndex = useAppSelector(
    (state) => state.game.replay.moveListIndex
  );

  const game = useAppSelector((state) =>
    id ? state.gamelist.games[id] : null
  );

  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  const onNudgeClick = useCallback(() => {
    if (!id) {
      return;
    }
    try {
      dispatch(nudgeGameById(id));
      dispatch(toggleNudgeButton(false));
    } catch (e) {
      toast(e.response?.data ?? e.response?.status ?? "Something went wrong", {
        type: "error",
      });
    }
  }, [dispatch, id]);

  // CQ: use cool-dimensions to measure game play area space?
  const fullHeight = use100vh() ?? window.innerHeight;
  const closedDrawerTop = fullHeight - (50 + 70);
  const openDrawerTop = 5;

  const drawerSpring = useSpring({
    top: drawerIsOpen ? openDrawerTop : closedDrawerTop,
  });

  const bind = useDrag(
    ({
      down,
      delta: [_dx, dy],
      movement: [_mx, my],
      distance: [_x, y],
      velocity: [_vx, vy],
      event,
    }) => {
      event.stopPropagation();
      if (down) {
        // drawerSpring.top.pause();
        const dragPos = drawerSpring.top.get() + dy;
        drawerSpring.top.set(
          drawerIsOpen
            ? Math.max(dragPos, openDrawerTop)
            : Math.min(dragPos, closedDrawerTop)
        );
      } else {
        if (y < 50 && vy < 1) {
          drawerSpring.top.start(
            drawerIsOpen ? openDrawerTop : closedDrawerTop
          );
          return;
        }
        // drawerSpring.top.resume();
        // alert('my: ' + my)
        if (my <= 0) {
          // alert('opening: ' + my + " / " + openDrawerTop)
          // drawerSpring.top.start(openDrawerTop);
          setDrawerIsOpen(true);
        } else {
          // alert('closing: ' + my)
          // drawerSpring.top.start(closedDrawerTop);
          setDrawerIsOpen(false);
        }
      }
    }
  );

  if (!game || !id || !isFullGame(game)) {
    return null;
  }

  return (
    <>
      <div className="h-[70px] flex-shrink-0"></div>
      <a.div
        style={{
          top: drawerSpring.top,
          height: fullHeight - (50 + 5),
        }}
        className="left-2 right-2 rounded-t-xl bg-primary absolute shadow-xl text-text flex flex-col items-center p-b-2"
      >
        <div
          {...bind()}
          className="touch-none select-none flex-shrink-0 flex flex-col items-center justify-center w-full p-1"
        >
          <FontAwesomeIcon icon={faGripLines} />
          <div className="flex items-center">
            {replayState ? "Replaying: " : "Last move: "}
            <div className="w-[200px]">
              <MoveListItem
                move={
                  replayState ? replayState : game.moves[game.moves.length - 1]
                }
                index={replayState ? replayIndex : game.moves.length - 1}
              />
            </div>
          </div>
        </div>
        <h3 className="w-[200px]">
          <span className="text-2xl font-bold m-0">Moves</span>
        </h3>
        {/* <div className="m-auto md:m-0 flex-shrink-0 w-[200px] pt-2 md:max-h-[calc(100vh-100px)] overflow-y-auto"> */}
        {/* {showingNudgeButton && (
            <div className="p-2 rounded-xl bg-primary flex flex-col mr-2">
              <p>Looks like the AI opponent is taking a long time to move</p>
              <Button
                onClick={onNudgeClick}
                className="text-white bg-darkbrown"
              >
                Nudge the bot
              </Button>
            </div>
          )} */}
        {/* <div className="flex flex-shrink-0 items-center text-darkbrown pt-2"> */}
        {/* <button
              onClick={() => {
                if (replayState) {
                  return dispatch(clearReplay());
                }
              }}
            >
              <FontAwesomeIcon
                className={classNames(
                  "mx-1 text-xl",
                  replayState && "text-blue-500 hover:text-red-500"
                )}
                icon={replayState ? faPlayCircle : faHistory}
              />
            </button> */}
        {/* </div> */}

        <ul className="flex-auto w-[200px] overflow-y-auto">
          {/* @ts-ignore */}
          {R.reverse(game.moves).map((move, i) => {
            const index = game.moves.length - i - 1;
            return <MoveListItem move={move} index={index} key={index} />;
          })}
        </ul>
        {/* </div> */}
      </a.div>
    </>
  );
}

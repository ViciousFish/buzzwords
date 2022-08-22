import React, { useCallback, useRef, useState } from "react";
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
import useDimensions from "react-cool-dimensions";

interface MoveListProps {
  id: string;
  mobileLayout: boolean;
}

export function MoveList({ id, mobileLayout }: MoveListProps) {
  const dispatch = useAppDispatch();
  const lowPowerMode = useAppSelector(({ settings }) => settings.lowPowerMode);
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

  const onInitiateReplay = useCallback(() => {
    setDrawerIsOpen(false);
  }, []);

  const listRef = useRef<HTMLDivElement>(null);

  const { height: drawerHeight, observe } = useDimensions();
  // CQ: use cool-dimensions to measure game play area space?
  const windowHeight = use100vh() ?? window.innerHeight;
  const closedDrawerTop = windowHeight - (70 + 50);
  const openDrawerTop = windowHeight - drawerHeight - 50;

  const drawerSpring = useSpring({
    top: drawerIsOpen ? openDrawerTop : closedDrawerTop,
    config: {
      clamp: true,
    },
    immediate: lowPowerMode,
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
          Math.max(Math.min(dragPos, closedDrawerTop), openDrawerTop)
        );
      } else {
        if (y < 50 && vy < 1) {
          drawerSpring.top.start(
            drawerIsOpen ? openDrawerTop : closedDrawerTop
          );
          return;
        }
        if (my <= 0) {
          setDrawerIsOpen(true);
        } else {
          setDrawerIsOpen(false);
        }
      }
    }
  );

  if (!game || !id || !isFullGame(game)) {
    return null;
  }

  const moveListContent = (
    <>
      <h3 className="w-[200px]">
        <span className="text-2xl font-bold m-0">Moves</span>
      </h3>
      <div className="flex-auto w-full overflow-y-auto">
        <div ref={listRef} className="overflow-y-auto max-h-full">
          <ul className="max-w-[200px] mx-auto">
            {/* @ts-ignore */}
            {R.reverse(game.moves).map((move, i) => {
              const index = game.moves.length - i - 1;
              return (
                <MoveListItem
                  move={move}
                  index={index}
                  key={index}
                  onInitiateReplay={onInitiateReplay}
                />
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div
        className={classNames(
          mobileLayout && "h-[70px] block",
          "w-[200px] flex flex-col flex-shrink-0 "
        )}
      >
        {!mobileLayout && moveListContent}
      </div>
      {mobileLayout && game.moves.length ? (
        <a.div
          ref={observe}
          style={{
            top: drawerSpring.top,
            maxHeight: windowHeight - (50 + 5),
          }}
          className={`left-2 right-2 z-20 rounded-t-xl bg-darkbg absolute shadow-upward 
        text-text p-b-2 flex flex-col items-center`}
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
                    replayState
                      ? replayState
                      : game.moves[game.moves.length - 1]
                  }
                  index={replayState ? replayIndex : game.moves.length - 1}
                  onInitiateReplay={onInitiateReplay}
                />
              </div>
            </div>
          </div>
          {moveListContent}
        </a.div>
      ) : null}
    </>
  );
}

/* <div className="m-auto md:m-0 flex-shrink-0 w-[200px] pt-2 md:max-h-[calc(100vh-100px)] overflow-y-auto"> */
{
  /* {showingNudgeButton && (
            <div className="p-2 rounded-xl bg-primary flex flex-col mr-2">
              <p>Looks like the AI opponent is taking a long time to move</p>
              <Button
                onClick={onNudgeClick}
                className="text-white bg-darkbrown"
              >
                Nudge the bot
              </Button>
            </div>
          )} */
}
{
  /* <div className="flex flex-shrink-0 items-center text-darkbrown pt-2"> */
}
{
  /* <button
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
            </button> */
}
{
  /* </div> */
}

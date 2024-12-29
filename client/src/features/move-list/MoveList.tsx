import React, { useCallback, useRef, useState } from "react";
import * as R from "ramda";
import { useSpring } from "@react-spring/three";
import { toast } from "react-toastify";
import { animated as a } from "@react-spring/web";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { nudgeGameById } from "../game/gameActions";
import { toggleNudgeButton } from "../game/gameSlice";
import { use100vh } from "react-div-100vh";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faGripLines } from "@fortawesome/free-solid-svg-icons";
import { useDrag } from "@use-gesture/react";
import classNames from "classnames";
import MoveListItem from "./MoveListItem";
import { isFullGame } from "../gamelist/gamelistSlice";
// import useDimensions from "react-cool-dimensions";
import { MoveDetailCard } from "./MoveDetailCard";
import { ActionButton } from "../../presentational/ActionButton";

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

  const game = useAppSelector((state) =>
    id ? state.gamelist.games[id] : null
  );

  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [scroll, setScroll] = useState(false);

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

  const windowHeight = use100vh() ?? window.innerHeight;
  const closedDrawerTop = windowHeight - (mobileLayout ? 70 + 50 : 0);
  const openDrawerTop = 20;

  const drawerSpring = useSpring({
    top: selectedMove !== null ? openDrawerTop : closedDrawerTop,
    config: {
      clamp: true,
    },
    immediate: lowPowerMode,
    onRest: () => setScroll(true),
    onStart: () => setScroll(false),
  });

  const bind = useDrag(({event}) => {
    event.stopPropagation();
  })

  // const bind = useDrag(
  //   ({
  //     down,
  //     delta: [_dx, dy],
  //     movement: [_mx, my],
  //     distance: [_x, y],
  //     velocity: [_vx, vy],
  //     event,
  //   }) => {
  //     event.stopPropagation();
  //     if (down) {
  //       // drawerSpring.top.pause();
  //       const dragPos = drawerSpring.top.get() + dy;
  //       drawerSpring.top.set(
  //         Math.max(Math.min(dragPos, closedDrawerTop), openDrawerTop)
  //       );
  //     } else {
  //       if (y < 50 && vy < 1) {
  //         drawerSpring.top.start(
  //           selectedMove !== null ? openDrawerTop : closedDrawerTop
  //         );
  //         return;
  //       }
  //       if (my <= 0 && game && isFullGame(game)) {
  //         setSelectedMove(game.moves.length - 1);
  //       } else {
  //         setSelectedMove(null);
  //       }
  //     }
  //   }
  // );

  if (!game || !id || !isFullGame(game)) {
    return null;
  }

  const moveListContent = (
    <>
      <h3 className="w-[200px] text-2xl font-bold m-0 pt-2 text-beeYellow-800 dark:text-beeYellow-200">Moves</h3>
      <div className="flex-auto w-full overflow-y-auto">
        <div className="overflow-y-auto max-h-full">
          <ul className="max-w-[200px] mx-auto">
            {/* @ts-ignore */}
            {R.reverse(game.moves).map((move, i) => {
              const index = game.moves.length - i - 1;
              return (
                <MoveListItem
                  move={move}
                  key={index}
                  onPress={() => setSelectedMove(index)}
                  isSelected={selectedMove === index}
                />
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );

  // const topMove = replayState ? replayState : game.moves[game.moves.length - 1];

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
      {game.moves.length ? (
        <a.div
          style={{
            top: drawerSpring.top,
            height: windowHeight - 70,
          }}
          className={`left-2 right-2 z-20 rounded-t-xl bg-darkbg border border-darkbrown absolute shadow-upward 
        text-text p-b-2 overflow-hidden grid grid-rows-[min-content,minmax(0,1fr)] items-stretch`}
        >
          {/* <div className="touch-none select-none flex-shrink-0 flex flex-col items-center justify-center w-full"> */}
            <div {...bind()} className="touch-none w-full flex items-center">
              <div className="flex-auto flex items-baseline flex-nowrap overflow-x-auto p-3">
                <span className="font-bold mx-2">Moves</span>
                {R.reverse(game.moves).map((move, i) => {
                  const index = game.moves.length - i - 1;
                  return (
                    <MoveListItem
                      move={move}
                      key={index}
                      onPress={() => setSelectedMove(index)}
                      isSelected={selectedMove === index}
                      scrollOnSelection={scroll}
                    />
                  );
                })}
              </div>
              {selectedMove !== null && (
                <ActionButton
                  className="mx-2"
                  onPress={(e) => {
                    setTimeout(() => {
                      setSelectedMove(null);
                    }, 10);
                  }}
                >
                  Dismiss
                </ActionButton>
              )}
            </div>
          {/* </div> */}
          {selectedMove !== null && (
            <MoveDetailCard
              mobileLayout={mobileLayout}
              move={game.moves[selectedMove]}
              index={selectedMove}
            />
          )}
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

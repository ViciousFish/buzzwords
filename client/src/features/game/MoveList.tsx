import React, { useCallback } from "react";
import { useSpring } from "@react-spring/three";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { nudgeGameById } from "./gameActions";
import { toggleNudgeButton } from "./gameSlice";
import { toast } from "react-toastify";

interface MoveListProps {
  id: string;
}

export function MoveList({ id }: MoveListProps) {
  const dispatch = useAppDispatch();
  const showingNudgeButton = useAppSelector(
    (state) => state.game.showingNudgeButton
  );
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
  const [drawerSpring, drawerSpringApi] = useSpring(() => {});
  return (
    <>
    <div className="h-[80px] bg-red-400"></div>
    <div>
      {/* <div className="m-auto md:m-0 flex-shrink-0 w-[200px] pt-2 md:max-h-[calc(100vh-100px)] overflow-y-auto">
          {showingNudgeButton && (
            <div className="p-2 rounded-xl bg-primary flex flex-col mr-2">
              <p>Looks like the AI opponent is taking a long time to move</p>
              <Button
                onClick={onNudgeClick}
                className="text-white bg-darkbrown"
              >
                Nudge the bot
              </Button>
            </div>
          )}
          <div className="flex flex-shrink-0 items-center text-darkbrown pt-2">
            <button
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
            </button>
            <h3 className="flex-auto">
              <span className="text-2xl font-bold m-0">Turns</span>
            </h3>
          </div>
          <ul className="">
            {R.reverse(game.moves).map((move, i) => {
              const index = game.moves.length - i - 1;
              return <MoveListItem move={move} index={index} key={index} />;
            })}
          </ul>
        </div>  */}
    </div>
    </>
  );
}

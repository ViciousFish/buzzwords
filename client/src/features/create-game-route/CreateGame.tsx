import React, { useState, useCallback } from "react";
import { pick } from "ramda";
import {
  Slider,
  Label,
  SliderThumb,
  SliderTrack,
  SliderOutput,
  Radio,
  RadioGroup,
} from "react-aria-components";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretRight,
  faGlobe,
  faRobot,
  faSkull,
  faSpinner,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
// import useDimensions from "react-cool-dimensions";
import { BREAKPOINTS } from "../../app/MainGameStructure";
import {
  CreateBotGameParams,
  createGame,
  CreateGameType,
} from "../gamelist/gamelistActions";
import { useNavigate } from "react-router";
import { FancyButton, FancyButtonVariant } from "../../presentational/FancyButton";

function GameType({
  title,
  subtitle,
  value,
  icon,
  disabled,
}: {
  title: string;
  subtitle?: string;
  value: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Radio
      isDisabled={disabled}
      value={value}
      aria-label={title}
      className={({ isSelected, isDisabled, isFocusVisible, isFocused }) =>
        classNames(
          isFocused && "outline",
          isFocusVisible && "outline",
          isSelected ? "bg-beeYellow-500 dark:bg-beeYellow-700" : "bg-beeYellow-400 dark:bg-beeYellow-800",
          isDisabled ? "opacity-40" : !isSelected && "hover:bg-darkbg",
          "flex box-border justify-between items-center p-4 lg:p-8 rounded-xl shadow-lg overflow-hidden",
          "my-6 first:mt-0 last:mb-0"
        )
      }
    >
      {({ isSelected }) => (
        <>
          <div className="flex flex-col">
            <div
              className={classNames(
                isSelected && "underline",
                "text-xl lg:text-lgl font-bold"
              )}
            >
              {title}
            </div>
            <div>{subtitle}</div>
          </div>
          <div className="flex flex-row flex-nowrap shrink-0 ml-2 gap-2 opacity-60">
            {icon}
          </div>
        </>
      )}
    </Radio>
  );
}

const DifficultyLabels = [
  "Beginner",
  "Beginner",
  "Easy",
  "Easy",
  "Medium",
  "Hard",
  "Harder",
  "Expert",
  "Expert+",
  <>
    <FontAwesomeIcon icon={faSkull} /> Impossible
  </>,
];

export const WIZARD_BREAKPOINTS = pick(["xs", "lg"], BREAKPOINTS);

function CreateGame() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] =
    useState<CreateGameType | null>(null);
  const [difficulty, setDifficulty] = useState(5);
  const [isSubmitting, setSubmitting] = useState(false);
  // const loggedIn = useAppSelector((state) =>
  //   Boolean(state.user.user?.googleId)
  // );
  const playButtonPress = useCallback(async () => {
    setSubmitting(true);
    const bot = selectedMode && selectedMode.endsWith("bot");
    const params = {
      type: selectedMode!,
    };
    if (bot) {
      (params as CreateBotGameParams).difficulty = difficulty;
    }
    try {
      const game = await dispatch(createGame(params));
      navigate(`/play/${game}`);
    } catch (e) {
      setSubmitting(false);
    }
  }, [selectedMode, difficulty, dispatch, navigate]);
  // const { currentBreakpoint, observe } = useDimensions({
  //   breakpoints: WIZARD_BREAKPOINTS,
  //   updateOnBreakpointChange: true,
  // });
  // const lg = currentBreakpoint === "lg";
  const bot = selectedMode && selectedMode.endsWith("bot");
  return (
    <div
      // ref={observe}
      className={classNames(
        "w-full h-full overflow-auto relative flex justify-center items-center",
        "text-beeYellow-800 dark:text-beeYellow-200"
        // lg && "items-center"
      )}
    >
      <div
        className={classNames(
          "max-w-[600px] w-full flex flex-shrink-0 items-stretch m-auto",
          // lg ? "flex-row" : "flex-col"
          "flex-col"
        )}
      >
        <div
          className={classNames(
            "flex flex-col justify-center p-4 mx-4",
            // lg && "mr-0 w-full"
          )}
        >
          <RadioGroup
            aria-label="Pick a game type"
            value={selectedMode ?? undefined}
            // @ts-expect-error allowed mode types too narrow
            onChange={setSelectedMode}
          >
          <Label className="text-lg font-bold text-text block text-center mb-4">
            Pick a game type
          </Label>
            <GameType
              value="online-bot"
              title="Online against a bot"
              subtitle="Start here"
              // subtitle={
              //   loggedIn
              //     ? "Sync game across devices. Game will only be playable online"
              //     : "Log in to sync bot games across devices"
              // }
              icon={
                <>
                  <FontAwesomeIcon size="lg" icon={faGlobe} />
                  <FontAwesomeIcon size="lg" icon={faRobot} />
                </>
              }
            />
            <GameType
              value="online-pvp"
              title="Online against a human"
              subtitle="Play in real time with a friend"
              icon={
                <>
                  <FontAwesomeIcon size="lg" icon={faGlobe} />
                  <FontAwesomeIcon size="lg" icon={faUser} />
                </>
              }
            />
            {/* <GameType
              disabled
              value="hotseat"
              title="Offline against a human"
              subtitle="Both players take turns on this device. Coming soon"
              icon={
                <>
                  <FontAwesomeIcon size="lg" icon={faUser} />
                </>
              }
            />
            <GameType
              disabled
              value="offline-bot"
              title="Offline against a bot"
              subtitle="Works without an internet connection. Coming soon"
              icon={
                <>
                  <FontAwesomeIcon size="lg" icon={faRobot} />
                </>
              }
            /> */}
          </RadioGroup>
        </div>
        <div
          className={classNames(
            "p-4 m-4 flex flex-col gap-5 justify-center items-stretch",
            // lg && "w-full ml-0"
          )}
        >
          {selectedMode && (
            <div
              className={classNames(
                selectedMode !== "hotseat" && "bg-beeYellow-400 dark:bg-beeYellow-800 shadow-lg",
                "p-3 rounded-xl"
              )}
            >
              {!bot && selectedMode !== "hotseat" && (
                <p className="p-4 mb-4 text-center">
                  We&apos;ll generate a link for you to send to your opponent
                </p>
              )}
              {bot && (
                <div className="p-4 mb-4 relative self-stretch">
                  <Slider
                    value={difficulty}
                    // @ts-ignore
                    onChange={setDifficulty}
                    minValue={1}
                    maxValue={10}
                    className="w-full p-2 flex flex-col gap-2"
                  >
                    <div className="flex justify-between">
                      <Label>Difficulty</Label>
                      <SliderOutput>
                        {({ state }) =>
                          state.values.map((val) => (
                            <>
                              {val} {DifficultyLabels[val - 1]}
                            </>
                          ))
                        }
                      </SliderOutput>
                    </div>
                    <SliderTrack className="h-[4px] rounded mt-2 bg-gradient-to-r from-purple-500 to-pink-500">
                      <SliderThumb
                        className={({ isFocusVisible }) =>
                          classNames(
                            isFocusVisible && "outline",
                            "relative top-[2px] w-[25px] h-[25px] rounded-full shadow",
                            "bg-gradient-to-t from-slate-200 to-slate-100 border-2 border-blue-300"
                          )
                        }
                      />
                    </SliderTrack>
                  </Slider>
                </div>
              )}
              <div className="flex justify-center">
                <FancyButton
                  isDisabled={isSubmitting}
                  onPress={playButtonPress}
                  className="text-xl font-bold text-black"
                  variant={FancyButtonVariant.Springtime}
                >
                  Play{" "}
                  <FontAwesomeIcon
                    className={isSubmitting ? "animate-spin" : ""}
                    icon={isSubmitting ? faSpinner : faCaretRight}
                  />
                </FancyButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateGame;

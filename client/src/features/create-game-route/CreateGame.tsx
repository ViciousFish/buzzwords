import React, { useState } from "react";
import { pick } from "ramda";
import {
  ListBox,
  Item,
  Text,
  Slider,
  Label,
  SliderThumb,
  SliderTrack,
  SliderOutput,
} from "react-aria-components";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretRight,
  faGlobe,
  faRobot,
  faSkull,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import useDimensions from "react-cool-dimensions";
import { BREAKPOINTS } from "../../app/MainGameStructure";

function GameType({
  title,
  subtitle,
  value,
  icon,
}: {
  title: string;
  subtitle?: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Item
      id={value}
      aria-label={title}
      className={({ isSelected, isDisabled, isFocusVisible, isFocused }) =>
        classNames(
          isFocused && "outline",
          isFocusVisible && "outline",
          isSelected ? "bg-primary" : "bg-lighterbg",
          isDisabled && "opacity-50",
          "flex box-border justify-between items-center p-6 lg:p-8 rounded-xl shadow-lg overflow-hidden",
          "my-8 first:mt-0 last:mb-0"
        )
      }
    >
      {({ isSelected }) => (
        <>
          <div className="flex flex-col">
            <Text slot="label" className={classNames(isSelected && "underline","text-xl lg:text-lgl font-bold")}>
              {title}
            </Text>
            <Text slot="description">{subtitle}</Text>
          </div>
          <div className="flex flex-row flex-nowrap shrink-0 ml-2 gap-2 opacity-60">
            {icon}
          </div>
        </>
      )}
    </Item>
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
  const [selectedMode, setSelectedMode] = useState<string>("offline-bot");
  const [difficulty, setDifficulty] = useState(5);
  const loggedIn = useAppSelector((state) =>
    Boolean(state.user.user?.googleId)
  );
  const { currentBreakpoint, observe } = useDimensions({
    breakpoints: WIZARD_BREAKPOINTS,
    updateOnBreakpointChange: true,
  });
  const lg = currentBreakpoint === "lg";
  const bot = selectedMode && selectedMode.endsWith('bot')
  return (
    <div
      ref={observe}
      className={classNames(
        "w-full flex flex-col items-center h-full overflow-scroll text-text",
        lg && "justify-center"
      )}
    >
      <div
        className={classNames(
          "max-w-[1200px] w-full flex flex-shrink-0 items-stretch gap-8 ",
          lg ? "flex-row" : "flex-col"
        )}
      >
        <div
          className={classNames(
            "flex flex-col justify-center p-4 mx-4",
            lg && "mr-0 w-full"
          )}
        >
          <h1 className="text-lg font-bold text-text text-center mb-4">
            Pick a game mode
          </h1>
          <ListBox
            onSelectionChange={(selection) =>
              setSelectedMode(
                selection !== "all" ? selection.values().next().value : null
              )
            }
            aria-label="Pick a game type"
            selectionMode="single"
            selectedKeys={[selectedMode]}
            disabledKeys={!loggedIn ? ["online-bot"] : []}
            disallowEmptySelection
          >
            <GameType
              value="offline-bot"
              title="Offline against a bot"
              icon={
                <>
                  <FontAwesomeIcon size="lg" icon={faRobot} />
                </>
              }
            />
            <GameType
              value="online-pvp"
              title="Online against a human"
              subtitle="Game will only be playable when connected to the internet"
              icon={
                <>
                  <FontAwesomeIcon size="lg" icon={faGlobe} />
                  <FontAwesomeIcon size="lg" icon={faUser} />
                </>
              }
            />
            <GameType
              value="online-bot"
              title="Online against a bot"
              subtitle={
                loggedIn
                  ? "Sync game across devices. Game will only be playable online"
                  : "Log in to sync bot games across devices"
              }
              icon={
                <>
                  <FontAwesomeIcon size="lg" icon={faGlobe} />
                  <FontAwesomeIcon size="lg" icon={faRobot} />
                </>
              }
            />
            <GameType
              value="hotseat"
              title="Offline against a human"
              subtitle="Both players take turns on this device"
              icon={
                <>
                  <FontAwesomeIcon size="lg" icon={faUser} />
                </>
              }
            />
          </ListBox>
        </div>
        <div
          className={classNames(
            "p-4 m-4 flex flex-col gap-8 justify-center items-stretch",
            lg && "w-full ml-0"
          )}
        >
          {selectedMode && (
            <div
              className={classNames(
                selectedMode !== "hotseat" && "bg-lighterbg shadow-lg",
                "p-3 rounded-xl"
              )}
            >
              {!bot && selectedMode !== 'hotseat' && <p className="p-4 mb-4 text-center">You&apos;ll invite your opponent on the next screen</p>}
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
                    <SliderTrack className="border border-gray-900 mt-2">
                      <SliderThumb
                        className={({ isFocusVisible }) =>
                          classNames(
                            isFocusVisible && "outline",
                            "topbar w-[25px] h-[25px] rounded-full shadow"
                          )
                        }
                      />
                    </SliderTrack>
                  </Slider>
                </div>
              )}
              <div className="flex justify-center">
                <Button className="p-6 text-2xl font-bold focus:outline">
                  Play <FontAwesomeIcon icon={faCaretRight} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateGame;

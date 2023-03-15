import React, { useState } from "react";

import Modal from "../../presentational/Modal";
import { Switch } from "../../presentational/Switch";
import { ListBox } from "../../presentational/ListBox";
import { Item, Section } from "@react-stately/collections";
import Button from "../../presentational/Button";
import { Slider } from "../../presentational/Slider";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSkull } from "@fortawesome/free-solid-svg-icons";
import { useAppSelector } from "../../app/hooks";

interface PlayModalProps {
  onCancel: () => void;
}

const DIFFICULTY_LABELS = [
  "Beginner",
  "Very easy",
  "Easier",
  "Easy",
  "Medium",
  "Hard",
  "Harder",
  "Expert",
  "Expert+",
  <>
    <FontAwesomeIcon icon={faSkull} />
  </>,
];

export function CreateGameModal({ onCancel }: PlayModalProps) {
  const hasAccount = useAppSelector((state) => Boolean(state.user.user?.googleId));
  const isOffline = useAppSelector(state => state.settings.offline);
  const [mode, setMode] = useState<string | null>(null);

  let cloudSubtext = 'Store games in the cloud.'

  if (isOffline) {
    cloudSubtext += " Unavailable offline."
  } else if (!hasAccount) {
    cloudSubtext += " Log in to sync bot games."
  }

  return (
    <Modal>
      <div className="rounded-xl bg-lightbg flex-shrink-0 flex flex-col items-stretch overflow-hidden">
        <div className="p-3 text-xl font-bold">Create Game</div>
        <div className="p-2">
          {/* <label className="ml-2" htmlFor="game-picker">
            Pick a game type
          </label> */}
          <div className="min-w-[310px] rounded-md border border-black/50">
            <ListBox
              id="game-picker"
              selectionMode="single"
              selectedKeys={mode ? [mode] : []}
              onSelectionChange={(keys) =>
                // @ts-expect-error we know we're only using strings
                keys && setMode(Array.from(keys)[0])
              }
            >
              {/* <Section title="Online"> */}
              <Item key="online-human" textValue="Play online vs a human">
                <strong>Online against a human</strong>
                <span>Send your opponent an invite link</span>
              </Item>
              <Item
                key="offline-human"
                textValue="Play offline vs a human (hotseat)"
              >
                <strong>Offline against a human</strong>
                <span>Hotseat on this device</span>
              </Item>
              <Item key="bot" textValue="Play online vs a bot">
                <strong>Against a bot</strong>
                <span></span>
              </Item>
              {/* <Item key="online-bot" textValue="Play online vs a bot">
                  <strong>Offline against a bot</strong>
                  <span>Play locally</span>
                </Item> */}
              {/* </Section>
                <Section title="Offline"> */}

              {/* <Item key="offline-bot" textValue="Play offline vs a bot">
                  <strong>Play vs a bot</strong>
                  <></>
                </Item> */}
              {/* </Section> */}
            </ListBox>
          </div>
          <div className="p-2">
            <Switch isDisabled={mode?.endsWith('human') || isOffline || !hasAccount}>
              <div className="flex flex-col">
              <strong>Cloud sync</strong>
              <span>{cloudSubtext}</span>
              </div>
            </Switch>
          </div>
          <div className="p-2">
            {mode && mode === 'bot' && (
              <Slider
                customValueFormatter={(value) => (
                  <>
                    {DIFFICULTY_LABELS[value - 1]} ({value})
                  </>
                )}
                minValue={1}
                maxValue={10}
                step={1}
                label={<>Difficulty</>}
              />
            )}
          </div>
        </div>
        <div>
          <Button onClick={onCancel}>Cancel</Button>
          <Button>Create</Button>
        </div>
      </div>
    </Modal>
  );
}
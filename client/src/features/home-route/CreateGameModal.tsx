import React, { useState } from "react";

import Modal from "../../presentational/Modal";
import { Switch } from "../../presentational/Switch";
import { ListBox } from "../../presentational/ListBox";
import { Item, Section } from "@react-stately/collections";
import Button from "../../presentational/Button";
import { Slider } from "../../presentational/Slider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSkull } from "@fortawesome/free-solid-svg-icons";

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
  const [mode, setMode] = useState<string | null>(null);
  console.log("🚀 ~ file: PlayModal.tsx:33 ~ PlayModal ~ mode:", mode)
  return (
    <Modal>
      <div className="rounded-xl bg-lightbg flex-shrink-0 flex flex-col items-stretch overflow-hidden">
        <div className="p-2 bg-darkbrown text-textInverse">Create Game</div>
        <div className="p-2">
          <div className="w-[300px]">
            <ListBox
              selectionMode="single"
              selectedKeys={mode ? [mode] : []}
              onSelectionChange={(keys) => keys && setMode(Array.from(keys)[0])}
            >
              <Section title="Online">
                <Item key="online-human" textValue="Play online vs a human">
                  Play vs a human
                </Item>
                <Item key="online-bot" textValue="Play online vs a bot">
                  Play vs a bot
                </Item>
              </Section>
              <Section title="Offline">
                <Item
                  key="offline-hotseat"
                  textValue="Play offline vs a human (hotseat)"
                >
                  Play vs a human
                </Item>
                <Item key="offline-bot" textValue="Play offline vs a bot">
                  Play vs a bot
                </Item>
              </Section>
            </ListBox>
            {mode && mode.endsWith("-bot") && (
              <Slider
                customValueFormatter={(value) => DIFFICULTY_LABELS[value - 1]}
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

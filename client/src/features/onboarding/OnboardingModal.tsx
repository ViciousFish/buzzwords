import React from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Modal from "../../presentational/Modal";
import { toggleTutorialModal } from "../game/gameSlice";
import { NicknameForm } from "../settings/NicknameForm";

const OnboardingModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const gamesList = useAppSelector((state) => state.gamelist.games);
  return (
    <Modal>
      <div className="p-8 bg-lightbg rounded-xl text-darkbrown">
        <h1 className="text-2xl">Pick a nickname</h1>
        <p>It doesn&apos;t have to be unique. Your opponents will see it.</p>
        <div className="bg-darkbg my-2 rounded-lg p-2">
        <NicknameForm
          afterSubmit={() => {
            const games = Object.values(gamesList);
            if (games.length === 1 && games[0].users.length === 2) {
              dispatch(toggleTutorialModal());
            }
          }}
        />
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingModal;

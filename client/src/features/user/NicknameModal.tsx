import { Formik } from "formik";
import * as yup from "yup";
import React from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import { setNickname } from "./userActions";
import Modal from "../../presentational/Modal";
import { toggleTutorialModal } from "../game/gameSlice";
import { NicknameForm } from "../settings/NicknameForm";

const NicknameValidationSchema = yup.object().shape({
  nickname: yup.string().required(),
});

const NicknameModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const gamesList = useAppSelector((state) => state.gamelist.games);
  return (
    <Modal>
      <div className="p-8 bg-lightbg rounded-xl text-darkbrown">
        <h1 className="text-2xl">Pick a nickname</h1>
        <p>It doesn&apos;t have to be unique. Your opponents will see it.</p>
        <label>
          Nickname
          <NicknameForm
            afterSubmit={() => {
              const games = Object.values(gamesList);
              if (games.length === 1 && games[0].users.length === 2) {
                dispatch(toggleTutorialModal());
              }
            }}
          />
        </label>
      </div>
    </Modal>
  );
};

export default NicknameModal;

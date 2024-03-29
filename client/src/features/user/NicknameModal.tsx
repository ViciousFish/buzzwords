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
    // <Modal>
    <div className="p-8 bg-lightbg text-text flex justify-center items-center h-full">
      <div className="p-8 shadow-lg rounded-xl bg-lighterbg">
        <h1 className="text-2xl font-bold">Pick a nickname</h1>
        <p>It doesn&apos;t have to be unique. Your opponents will see it.</p>
        <div className="mt-2">
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
    </div>
    // </Modal>
  );
};

export default NicknameModal;

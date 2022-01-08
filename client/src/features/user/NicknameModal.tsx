import { Formik } from "formik";
import * as yup from "yup";
import React from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../../presentational/Button";
import { setNickname } from "./userActions";
import Modal from "../../presentational/Modal";
import { toggleTutorialModal } from "../game/gameSlice";

const NicknameValidationSchema = yup.object().shape({
  nickname: yup.string().required(),
});

const NicknameModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const gamesList = useAppSelector((state) => state.gamelist.games);
  return (
    <Formik
      initialValues={{ nickname: "" }}
      onSubmit={async (values, { setSubmitting, setStatus }) => {
        try {
          await dispatch(setNickname(values.nickname));
          const games = Object.values(gamesList);
          if (games.length === 1 && games[0].users.length === 2) {
            dispatch(toggleTutorialModal());
          }
        } catch (e) {
          setStatus({
            type: "error",
            message: e.toString(),
          });
          setSubmitting(false);
        }
      }}
      validationSchema={NicknameValidationSchema}
    >
      {({
        values,
        isValid,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        status,
      }) => (
        <Modal>
          <div className="p-8 bg-lightbg rounded-xl text-darkbrown">
            <h1 className="text-2xl">Pick a nickname</h1>
            <p>
              It doesn&apos;t have to be unique, but you can&apos;t change it
              (yet). Your opponents will see it.
            </p>
            <form
              onSubmit={handleSubmit}
              className="bg-darkbg p-2 flex items-center rounded-md my-2"
            >
              <label htmlFor="nick-input" className="mr-2">
                nickname
              </label>
              <input
                className="p-2 rounded-md flex-auto"
                id="nick-input"
                name="nickname"
                type="text"
                value={values.nickname}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <Button disabled={!isValid || isSubmitting} type="submit">
                save
              </Button>
            </form>
            {status && (
              <div className="bg-red-400 text-black rounded-md p-2">
                {status.message}
              </div>
            )}
          </div>
        </Modal>
      )}
    </Formik>
  );
};

export default NicknameModal;

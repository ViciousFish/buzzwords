import React from "react";
import { Formik } from "formik";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setNickname } from "../user/userActions";
import Button from "../../presentational/Button";
import { ActionButton } from "../../presentational/ActionButton";
import {
  INPUT_BG,
  INPUT_BORDER,
  INPUT_TEXT,
} from "../../presentational/InputColors";
import classNames from "classnames";

const NicknameValidationSchema = yup.object().shape({
  nickname: yup.string().required(),
});

interface NicknameFormProps {
  afterSubmit?: () => void;
  onCancel?: () => void;
}

export const NicknameForm = ({ afterSubmit, onCancel }: NicknameFormProps) => {
  const dispatch = useAppDispatch();
  const currentNickname = useAppSelector((state) => state.user.user?.nickname);
  return (
    <Formik
      initialValues={{ nickname: currentNickname ?? "" }}
      onSubmit={async (values, { setSubmitting, setStatus }) => {
        try {
          await dispatch(setNickname(values.nickname));
          afterSubmit?.();
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
        <>
          <form
            onSubmit={handleSubmit}
            className="w-full rounded-md flex flex-col items-end"
          >
            <label className="flex flex-col w-full">
              <span className="pl-2 text-sm">Nickname</span>
              <input
                autoFocus
                className={`${INPUT_BG} ${INPUT_TEXT} ${INPUT_BORDER} w-full p-2 rounded-md border-2`}
                name="nickname"
                type="text"
                value={values.nickname}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </label>
            <div className="mt-2 flex gap-2">
              {onCancel && (
                <ActionButton
                  isDisabled={isSubmitting}
                  type="button"
                  onPress={onCancel}
                >
                  cancel
                </ActionButton>
              )}
              <ActionButton
                colorClasses={classNames([
                  "border-beeYellow-510 dark:border-beeYellow-600",
                  "bg-beeYellow-500 dark:bg-beeYellow-700",
                  "hover:bg-beeYellow-510 hover:dark:bg-beeYellow-600",
                  "hover:border-beeYellow-600 dark:hover:border-beeYellow-510",
                  "text-beeYellow-950 dark:text-beeYellow-100",
                ])}
                isDisabled={!isValid || isSubmitting}
                type="submit"
              >
                save
              </ActionButton>
            </div>
          </form>
          {status && (
            <div className="bg-red-400 text-black rounded-md p-2">
              {status.message}
            </div>
          )}
        </>
      )}
    </Formik>
  );
};

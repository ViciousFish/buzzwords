import React from "react";
import { Formik } from "formik";
import * as yup from "yup";
import { useAppDispatch } from "../../app/hooks";
import { setNickname } from "../user/userActions";
import Button from "../../presentational/Button";

const NicknameValidationSchema = yup.object().shape({
  nickname: yup.string().required(),
});

interface NicknameFormProps {
  afterSubmit?: () => void;
  onCancel?: () => void;
}

export const NicknameForm = ({ afterSubmit, onCancel }: NicknameFormProps) => {
  const dispatch = useAppDispatch();
  return (
    <Formik
      initialValues={{ nickname: "" }}
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
            className="bg-input p-2 rounded-md flex items-center border-2 border-primary my-2"
          >
            <input
              autoFocus
              className=" flex-auto outline-none text-text "
              name="nickname"
              type="text"
              value={values.nickname}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {onCancel && (
              <Button
                disabled={isSubmitting}
                type="button"
                onClick={onCancel}
              >
                cancel
              </Button>
            )}
            <Button disabled={!isValid || isSubmitting} type="submit">
              save
            </Button>
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

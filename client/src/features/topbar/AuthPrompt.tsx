import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { ErrorMessage, Field, Formik } from "formik";
import React, { useState } from "react";
import * as yup from "yup";

import { useAppDispatch } from "../../app/hooks";
import Button from "../../presentational/Button";
import { getGoogleLoginURL } from "../user/userActions";

// const AuthRegister: React.FC = () => {};

const LoginValidationSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

const AuthLogin: React.FC = () => {
  return (
    <>
      <h3 className="text-lg text-text font-bold m-0">Login</h3>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={LoginValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          console.log(values.email);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <div className="min-w-[300px] text-text">
            <div className="flex flex-col">
              <label htmlFor="login-email">Email</label>
              <Field
                className="block rounded p-2 bg-white bg-opacity-75"
                id="login-email"
                type="email"
                name="email"
              />
              {/* @ts-ignore */}
              <ErrorMessage
                className="opacity-75 text-sm"
                name="email"
                component="div"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="login-password">Password</label>
              <Field
                className="block rounded p-2 bg-white bg-opacity-75"
                id="login-password"
                type="password"
                name="password"
              />
              {/* @ts-ignore */}
              <ErrorMessage
                className="opacity-75 text-sm"
                name="password"
                component="div"
              />
            </div>
            <div className="flex justify-center mt-2">
              <Button
                variant="dark"
                className="text-sm flex-auto"
                disabled={isSubmitting}
              >
                Login
              </Button>
            </div>
          </div>
        )}
      </Formik>
    </>
  );
};

interface AuthPromptProps {
  onDismiss: () => void;
}

type AuthPromptView =
  | "login-options"
  | "user-pass-login"
  | "user-pass-register";

const AuthPrompt: React.FC<AuthPromptProps> = ({ onDismiss }) => {
  const dispatch = useAppDispatch();
  const [view, setView] = useState<AuthPromptView>("login-options");
  return (
    <div
      className={classNames(
        "p-4 items-stretch rounded-xl shadow-lg border-2",
        "border-beeYellow-600 dark:border-beeYellow-700 bg-beeYellow-400 dark:bg-beeYellow-800",
        "text-beeYellow-900 dark:text-beeYellow-200"
      )}
    >
      <button
        aria-label="dismiss login prompt"
        className="float-right hover:opacity-75"
        onClick={onDismiss}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      {view === "login-options" && (
        <>
          <h3 className="text-lg font-bold m-0">
            Link an account
            <span className="font-light text-md opacity-75"> (optional)</span>
          </h3>
          <p>to sync your games across devices</p>
          <div className="flex">
            <button
              type="button"
              className={classNames(
                "mt-2 mb-2 flex items-center flex-auto bg-beeYellow-900 text-beeYellow-200 p-2 text-sm hover:bg-opacity-50",
                "rounded-full inset-shadow transition-all"
              )}
              onClick={() => dispatch(getGoogleLoginURL())}
            >
              <FontAwesomeIcon className="mx-2" icon={faGoogle} /> Sign in with
              Google
            </button>
          </div>
          {/* <div className="my-2 flex space-x-2">
            <button
              type="button"
              onClick={() => setView("user-pass-login")}
              className="flex-auto bg-darkbrown text-white p-2 text-sm hover:bg-opacity-50 rounded-full inset-shadow transition-all"
            >
              Log in with email
            </button>
            <button className="flex-auto bg-darkbrown text-white p-2 text-sm hover:bg-opacity-50 rounded-full inset-shadow transition-all">
              Register with email
            </button>
          </div> */}
          <p className="px-2 text-xs opacity-75 max-w-xs">
            Don&apos;t worry, the game will continue to work just fine if you
            choose not to.
          </p>
        </>
      )}
      {view === "user-pass-login" && (
        <>
          <button
            className="underline text-sm"
            onClick={() => {
              setView("login-options");
            }}
            type="button"
          >
            back
          </button>
          <AuthLogin />
        </>
      )}
    </div>
  );
};

export default AuthPrompt;

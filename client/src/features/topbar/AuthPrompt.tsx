import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import { getApiUrl } from "../../app/apiPrefix";

interface AuthPromptProps {
  onDismiss: () => void;
}

const AuthPrompt: React.FC<AuthPromptProps> = ({ onDismiss }) => {
  return (
    <div className="rounded-xl bg-primary shadow-lg p-4">
      <button
        aria-label="dismiss login prompt"
        className="float-right hover:opacity-75"
        onClick={onDismiss}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <h3 className="text-lg font-bold m-0">Link an account</h3>
      <p>to sync your games across devices</p>
      <div className="my-2">
        <a
          className={classNames(
            "block bg-darkbrown text-white p-2 text-sm hover:bg-opacity-50",
            "rounded-full inset-shadow transition-all"
          )}
          href={getApiUrl("/login/google")}
        >
          <FontAwesomeIcon className="mx-2" icon={faGoogle} /> Sign in with
          Google
        </a>
      </div>
      <p className="px-2 text-xs opacity-75 max-w-xs">
        Don&apos;t worry, the game will continue to work just fine if you choose
        not to.
      </p>
    </div>
  );
};

export default AuthPrompt;

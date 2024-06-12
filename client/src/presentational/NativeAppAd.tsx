import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";

const NativeAppAd = React.forwardRef<HTMLDivElement, {}>((props, ref) => {
  return (
    <div
      ref={ref}
      className={classNames(
        "p-4 items-stretch rounded-xl shadow-lg border-2",
        "border-beeYellow-600 dark:border-beeYellow-700 bg-beeYellow-400 dark:bg-beeYellow-800",
        "text-beeYellow-900 dark:text-beeYellow-200"
      )}
    >
      <div className="flex gap-2 mb-2 items-center">
        <img
          className="drop-shadow"
          src="/apple-touch-icon.png"
          style={{ width: 70 }}
        />
        <div>
          <h3 className="text-xl font-bold">The Buzzwords App</h3>
          <h4 className="italic opacity-80">
            The game you love, now on your machine
          </h4>
        </div>
      </div>
      <p>Download today for</p>
      <ul className="pl-4 ml-2 list-disc">
        <li>Buzzwords at your fingertips</li>
        <li>Push notifications when it&apos;s your turn</li>
        <li>Windows and Mac</li>
      </ul>
      <p>Coming soon</p>
      <ul className="pl-4 ml-2 list-disc">
        <li>Linux support</li>
        <li>iOS and Android</li>
        <li>Play offline</li>
      </ul>
      <a
        target="_blank"
        rel="noreferrer"
        href="https://chuckdries.itch.io/buzzwords"
        className="block text-center bg-beeYellow-900 text-beeYellow-300 hover:bg-beeYellow-800 rounded-full p-2 m-1 transition-all active:transform active:scale-90 active:bg-opacity-100 inset-shadow"
      >
        Download Now{" "}
        <FontAwesomeIcon
          className="opacity-70"
          size="sm"
          icon={faExternalLinkAlt}
        />
      </a>
    </div>
  );
});

NativeAppAd.displayName = "NativeAppAd";

export default NativeAppAd;

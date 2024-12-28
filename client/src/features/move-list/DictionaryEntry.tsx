import React, { useState, useCallback, useEffect } from "react";
import {
  faBook,
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import relativeDate from "tiny-relative-date";
import classNames from "classnames";
import { useDateFormatter } from "@react-aria/i18n";

function isMoreThanADayAgo(input: Date) {
  const today = new Date();
  return 86400000 > today.getTime() - input.getTime();
}

interface DictionaryEntryProps {
  word: string;
  moveDate?: Date;
  isForfeit?: boolean;
  playerIndex: number;
  mobileLayout: boolean;
  index: number;
}

export function DictionaryEntry({
  word,
  moveDate,
  isForfeit,
  playerIndex,
  mobileLayout,
  index,
}: DictionaryEntryProps) {
  const [dictionaryData, setDictionaryData] = useState(null as any | null);
  const fetchDefinition = useCallback(async (word: string) => {
    try {
      const res = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
        { withCredentials: false }
      );
      setDictionaryData(res.data);
    } catch (e) {
      setDictionaryData({
        type: "error",
        status: e.response?.status,
      });
    }
  }, []);

  const df = useDateFormatter({
    dateStyle: "short",
    timeStyle: "short",
  });

  useEffect(() => {
    if (!dictionaryData) {
      fetchDefinition(word);
    }
  }, [fetchDefinition, word, dictionaryData]);
  return (
    <div
      className={classNames(
        mobileLayout ? "w-full" : "h-full w-80 pt-8",
        "p-2 overflow-hidden flex flex-col"
      )}
    >
      {isForfeit && (
        <div className="font-serif italic p-1 rounded-md bg-black/10 text-center">
          Player {playerIndex + 1} resigned
        </div>
      )}
      <h1 className="capitalize text-4xl font-bold mr-2 font-serif">
        {index + 1}. {word}
      </h1>
      {moveDate && (
        <span
          title={new Date(moveDate).toLocaleString()}
          className="text-xs opacity-50"
        >
          {isMoreThanADayAgo(moveDate)
            ? relativeDate(moveDate)
            : df.format(moveDate)}{" "}
          &bull; {word.length} letters
        </span>
      )}
      {dictionaryData ? (
        <>
          {dictionaryData.type === "error" && (
            <div className="flex justify-center p-4 gap-1 items-center">
              <FontAwesomeIcon className="mr-1" icon={faBook} />
              <FontAwesomeIcon className="mr-1" icon={faExclamationTriangle} />
              {dictionaryData.status === "404" ? (
                <p>404: The dictionary API we use is missing a lot of words</p>
              ) : (
                dictionaryData.status
              )}
            </div>
          )}
          {dictionaryData.type !== "error" && (
            <ul className="text-sm overflow-auto flex-auto">
              {dictionaryData[0].meanings.map((meaning, index) => {
                return (
                  <li
                    className={classNames(
                      mobileLayout ? "mb-2" : "my-3",
                      "font-serif opacity-75"
                    )}
                    key={index}
                  >
                    <span className="italic mr-2 opacity-75">
                      {meaning.partOfSpeech}
                    </span>
                    {meaning.definitions.map(({ definition }, index) => (
                      <p className="ml-4 -indent-2" key={index}>
                        {definition}
                      </p>
                    ))}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <div className="flex justify-center p-4">
          <FontAwesomeIcon className="mr-2" icon={faBook} />
          <FontAwesomeIcon className="animate-spin" icon={faSpinner} />
        </div>
      )}
    </div>
  );
}

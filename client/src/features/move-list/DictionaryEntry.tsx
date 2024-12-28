import React, { useState, useCallback, useEffect } from "react";
import {
  faBook,
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import relativeDate from "tiny-relative-date";

interface DictionaryEntryProps {
  word: string;
  moveDate?: Date;
}
export function DictionaryEntry({ word, moveDate }: DictionaryEntryProps) {
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

  useEffect(() => {
    if (!dictionaryData) {
      fetchDefinition(word);
    }
  }, [fetchDefinition, word, dictionaryData]);
  return (
    <div className="h-40 p-2 overflow-hidden flex flex-col">
      <h1 className="capitalize text-4xl font-bold mr-2 font-serif">{word}</h1>
      {moveDate && (
        <span
          title={new Date(moveDate).toLocaleString()}
          className="text-xs opacity-50"
        >
          {relativeDate(moveDate)}
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
              {/* @ts-ignore */}
              {dictionaryData[0].meanings.map((meaning, index) => {
                return (
                  <li key={index} className="mb-2">
                    <p className="font-serif inline-block opacity-75">
                      <span className="italic mr-2 opacity-75">
                        {meaning.partOfSpeech}
                      </span>
                      {meaning.definitions
                        .map((def) => def.definition)
                        .join("/")}
                    </p>
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

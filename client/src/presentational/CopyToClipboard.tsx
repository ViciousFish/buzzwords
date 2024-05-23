import React, { useCallback, useEffect, useState } from "react";
import copy from "copy-to-clipboard";
// import Button from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-aria-components";
import { ActionButton } from "./ActionButton";

interface CopyToClipboardProps {
  text: string;
  label?: string;
}
const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(() => {copy(text); setCopied(true)}, [text]);
  useEffect(() => {
    setTimeout(() => {
      setCopied(false)
    }, 5000)
  }, [copied])
  return (
    <ActionButton onPress={onCopy}>
      <div className="flex flex-row gap-2 items-center">
      {label || "copy"} {copied && <FontAwesomeIcon icon={faCheck} />}
      </div>
    </ActionButton>
  );
};

export default CopyToClipboard;

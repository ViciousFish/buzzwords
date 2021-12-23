import React, { useCallback, useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import Button from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

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
    <Button type="button" onClick={onCopy}>
      {label || "copy"} {copied && <FontAwesomeIcon icon={faCheck} />}
    </Button>
  );
};

export default CopyToClipboard;

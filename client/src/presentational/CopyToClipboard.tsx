import React, { useCallback, useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import Button from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { NewButton } from "./NewButton";

interface CopyToClipboardProps {
  text: string;
  label?: string;
  variant?: React.ComponentProps<typeof Button>['variant']
}
const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text, label, variant }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(() => {copy(text); setCopied(true)}, [text]);
  useEffect(() => {
    setTimeout(() => {
      setCopied(false)
    }, 5000)
  }, [copied])
  return (
    <NewButton variant='blue' onPress={onCopy}>
      {label || "copy"} {copied && <FontAwesomeIcon icon={faCheck} />}
    </NewButton>
  );
};

export default CopyToClipboard;

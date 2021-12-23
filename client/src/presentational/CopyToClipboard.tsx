import React, { useCallback } from "react";
import copy from "copy-to-clipboard";
import Button from "./Button";

interface CopyToClipboardProps {
  text: string;
  label?: string;
}
const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text, label }) => {
  const onCopy = useCallback(() => copy(text), [text]);
  return (
    <Button type="button" onClick={onCopy}>
      {label || "copy"}
    </Button>
  );
};

export default CopyToClipboard;

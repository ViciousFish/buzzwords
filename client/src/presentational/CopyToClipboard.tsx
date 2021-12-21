import React, { useCallback } from "react";
import copy from "copy-to-clipboard";

interface CopyToClipboardProps {
  text: string;
}
const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text }) => {
  const onCopy = useCallback(() => copy(text), [text]);
  return (
    <button type="button" onClick={onCopy}>
      copy
    </button>
  );
};

export default CopyToClipboard;

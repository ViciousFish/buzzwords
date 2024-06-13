import React from "react";
import classNames from "classnames";
import { Button } from "react-aria-components";
import { INPUT_BG, INPUT_BORDER, INPUT_TEXT } from "./InputColors";

export function ActionButton({
  className,
  colorClasses,
  ...props
}: React.ComponentProps<typeof Button> & { colorClasses?: string }) {
  return (
    <Button
      className={classNames(
        "cursor-default p-1 rounded-md border-2 block",
        className,
        colorClasses ?? [
          INPUT_TEXT,
          "bg-bYellow-500 dark:bg-bBrown-700",
          "border-2 border-bYellow-700 dark:border-bBrown-500",
          "hover:bg-bYellow-600 dark:hover:bg-bBrown-500",
          "hover:border-bYellow-900 dark:hover:border-bBrown-300",
        ]
      )}
      {...props}
    />
  );
}

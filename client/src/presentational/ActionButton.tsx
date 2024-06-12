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
          "bg-beeYellow-300 dark:bg-beeYellow-800",
          "border-2 border-beeYellow-400 dark:border-beeYellow-700",
          "hover:bg-beeYellow-300 dark:hover:bg-beeYellow-700",
          "hover:border-beeYellow-500 dark:hover:border-beeYellow-600",
        ]
      )}
      {...props}
    />
  );
}

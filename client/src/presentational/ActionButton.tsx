import React from "react";
import classNames from "classnames";
import { Button } from "react-aria-components";

export function ActionButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={classNames(
        "cursor-default p-1 rounded border-2 border-slate-300 hover:bg-slate-100 block",
        className
      )}
      {...props}
    />
  );
}

import classNames from "classnames";
import React from "react";
import { Button, ButtonProps } from "react-aria-components";

export const TopBarButton = React.forwardRef(function TopBarButtonImpl(
  { className, ...props }: ButtonProps,
  ref
) {
  return (
    <Button
      ref={ref as any}
      className={classNames(
        "hover:bg-bYellow-800 hover:dark:bg-beeYellow-800 text-beeYellow-900 dark:text-beeYellow-300",
        "rounded-md p-2 cursor-auto",
        className
      )}
      {...props}
    />
  );
});

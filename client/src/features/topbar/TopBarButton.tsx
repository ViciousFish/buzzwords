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
        "hover:bg-bBrown-975 hover:dark:bg-bYellow-800 text-bYellow-300 dark:text-bBrown-300",
        "rounded-md py-2 cursor-auto",
        className
      )}
      {...props}
    />
  );
});
